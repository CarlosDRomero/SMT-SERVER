import supertest from "supertest"
import app from "../app.js"
import { pool } from "../database/conexion.js"
import { limpiarTablas } from "./test_helper.js"
import moment from "moment"
import { tokens } from "../services/tokens.js"

app.removeAllListeners()
const api = supertest(app)


beforeAll(async () => {
  await limpiarTablas();
})



describe("Tests ruta /auth/login", () => {
  describe("Test de usuario no confirmado", () => {
    beforeAll(async () => {
      
      await api.post("/auth/register").send({
        nombres: "Test",
        apellidos: "Test Man",
        clave: "test",
        email: "testing@tests.test.t.com",
        fecha_nac: "2003-06-06"
      })
      
    })
    test("Si un usuario no ha confirmado, no puede logear, pero recibe info para verificarse, status 200", async () => {
      const credenciales = { email: "testing@tests.test.t.com", clave: "test" }
      let res = await pool.query("SELECT * FROM usuario WHERE nombre_usuario='testing'")
      
      expect(res.rows[0].fecha_confirmado).toBeNull()
      
      await api.post("/auth/login").send(credenciales).expect(200)

      const result =  await pool.query(`SELECT * FROM codigo_verificacion WHERE idusuario='${res.rows[0].idusuario}'`)
      expect(result.rows[0]).toBeDefined();
    })
    test("Si ha pasado mas de 1 minuto desde la ultima confirmacion, se crea un codigo de verificacion, status 200", async () => {
      const credenciales = { email: "testing@tests.test.t.com", clave: "test" }
      await pool.query("UPDATE usuario SET confirmado=true WHERE email='testing@tests.test.t.com' RETURNING *")
      const r = await pool.query("SELECT * FROM usuario where email='testing@tests.test.t.com'")
      console.log(r.rows[0])
      const fecha_expirada = moment(r.rows[0].fecha_confirmado).subtract(1,"m").format("YYYY-MM-DD H:mm:s.SSS");

      console.log("FECHA CAMBIADA: ", fecha_expirada)
      const result = await pool.query(`UPDATE usuario SET fecha_confirmado='${fecha_expirada}' WHERE email='testing@tests.test.t.com' RETURNING *`)
      
      console.log("FECHA ACT: ", result.rows[0].fecha_confirmado)
      const res = await api.post("/auth/login").send(credenciales).expect(200)
      console.log("id: ", res.body.verificationId)
      expect(res.body.verificationId).toBeDefined()
      
      
    })
  })
  describe("Tests de usuario ya confirmado", () => {
    beforeAll(async () => {
      await limpiarTablas();
      await api.post("/auth/register").send({
        nombres: "Test",
        apellidos: "Test Man",
        clave: "test",
        email: "testing@tests.test.t.com",
        fecha_nac: "2003-06-06"
      })
      await pool.query("UPDATE usuario SET confirmado=true WHERE email='testing@tests.test.t.com'")
    })
  
    test("Si se pasan bien las credenciales entonces se recibe un token JWT", async () => {
      const credenciales = { email: "testing@tests.test.t.com", clave: "test" }
      const res = await api.post("/auth/login").send(credenciales).expect(200)
      
      expect(res.body.token).toBeDefined()
      expect(tokens.verifyToken(res.body.token)).not.toBeNull();
    })
    test("Si se pasan mal las credenciales entonces se recibe un 401 con un mensaje de error en un objeto JSON", async () => {
  
      const credenciales = { email: "testing@tests.test.t.com", clave: "noes" }
      const res = await api.post("/auth/login").send(credenciales).expect(401)
  
      expect(res.body.error).toBeDefined()
      expect(res.body.error.toLowerCase()).toContain("credenciales")
    })
  })
  describe("Rutas protegidas", () => {
    beforeAll(async () => {
      await limpiarTablas();
      await api.post("/auth/register").send({
        nombres: "un admin",
        apellidos: "ese admin",
        clave: "admin",
        email: "admin@tests.test.t.com",
        fecha_nac: "2003-06-06"
      })
      await pool.query("UPDATE usuario SET confirmado=true WHERE email='admin@tests.test.t.com'")
    })
    
    test("Solo un admin puede crear una cuenta a un empleado en /auth/register/empleado", async () => {
      const credenciales = { clave: "admin", email: "admin@tests.test.t.com" }
      const nuevoEmpleado = {
        nombres: "un empleado",
        apellidos: "ese empleado",
        clave: "emp",
        email: "emp@tests.test.t.com",
        fecha_nac: "2003-06-06"
      }
      
      let res = await api.post("/auth/login").send(credenciales).expect(200)
      expect(res.body.token).toBeDefined()
      let res2 = await api.post("/auth/register/empleado").set("Authorization", `Bearer ${res.body.token}`).send(nuevoEmpleado).expect(401)
      await pool.query("UPDATE usuario SET rol='admin' WHERE email='admin@tests.test.t.com'")
      res2 = await api.post("/auth/register/empleado").set("Authorization", `Bearer ${res.body.token}`).send(nuevoEmpleado).expect(200)

      const result = (await pool.query("SELECT * FROM usuario WHERE email='emp@tests.test.t.com'")).rows[0];

      expect(result.rol, "Se registro pero seguramente no como empleado").toEqual("empleado");
      // res = await api.post("/auth/login").send(credenciales).expect(200)
    })
  })
})

afterAll(async () => {
  await pool.end()
})