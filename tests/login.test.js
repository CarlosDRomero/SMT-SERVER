import supertest from "supertest"
import app from "../app.js"
import { pool } from "../database/database.js"
import { limpiarTablas } from "./test_helper.js"
import moment from "moment"
import { tokens } from "../utils/tokens.js"

app.removeAllListeners()
const api = supertest(app)






describe("Tests ruta /auth/login", () => {
  describe("Test de usuario no confirmado", () => {
    beforeAll(async () => {
      await limpiarTablas();
      await api.post("/auth/register").send({
        nombres: "Test",
        apellidos: "Test Man",
        clave: "test",
        email: "testing@gmail.com",
        fecha_nac: "2003-06-06"
      })
      
    })
    test("Si un usuario no ha confirmado, no puede logear, status 403", async () => {
      const credenciales = { email: "testing@gmail.com", clave: "test" }
      let res = await pool.query("SELECT * FROM usuario WHERE nombre_usuario='testing'")
      
      expect(res.rows[0].confirmado).toEqual(false)
      
      await api.post("/auth/login").send(credenciales).expect(403)

      const result =  await pool.query(`SELECT * FROM codigos_verificacion WHERE idusuario='${res.rows[0].idusuario}'`)
      expect(result.rows[0]).toBeDefined();
    })
    test("Si ha pasado mas de 5 minuto desde la ultima confirmacion, se crea un codigo de verificacion, status 403", async () => {
      const credenciales = { email: "testing@gmail.com", clave: "test" }
      await pool.query("UPDATE usuario SET confirmado=true WHERE email='testing@gmail.com'")
      const fecha_expirada = moment().subtract(1,"m").format("YYYY-MM-DD H:mm:s.SSS");
      console.log("FECHA CAMBIADA: ", fecha_expirada)
      const result = await pool.query(`UPDATE usuario SET fecha_confirmado='${fecha_expirada}' WHERE email='testing@gmail.com' RETURNING *`)
      
      console.log("FECHA ACT: ", result.rows[0].fecha_confirmado)
      const res = await api.post("/auth/login").send(credenciales).expect(403)

      expect(res.body.token).toBeDefined()
      
      
    })
  })
  describe("Tests de usuario ya confirmado", () => {
    beforeAll(async () => {
      await limpiarTablas();
      await api.post("/auth/register").send({
        nombres: "Test",
        apellidos: "Test Man",
        clave: "test",
        email: "testing@gmail.com",
        fecha_nac: "2003-06-06"
      })
      await pool.query("UPDATE usuario SET confirmado=true WHERE email='testing@gmail.com'")
    })
  
    test("Si se pasan bien las credenciales entonces se recibe un token JWT", async () => {
      const credenciales = { email: "testing@gmail.com", clave: "test" }
      const res = await api.post("/auth/login").send(credenciales).expect(200)
      
      // console.log(res.token);
      expect(res.body.token).toBeDefined()
      expect(tokens.tokenSign(res.body.token)).toBeTruthy();
    })
    test("Si se pasan mal las credenciales entonces se recibe un 401 con un mensaje de error en un objeto JSON", async () => {
  
      const credenciales = { email: "testing@gmail.com", clave: "noes" }
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
        email: "admin@gmail.com",
        fecha_nac: "2003-06-06"
      })
    })
    
    test("Solo un admin puede crear una cuenta a un empleado en /auth/register/empleado", async () => {
      const credenciales = { clave: "admin", email: "admin@gmail.com" }
      const nuevoEmpleado = {
        nombres: "un empleado",
        apellidos: "ese empleado",
        clave: "emp",
        email: "emp@gmail.com",
        fecha_nac: "2003-06-06"
      }
      
      let res = await api.post("/auth/login").send(credenciales).expect(200)
      expect(res.body.token).toBeDefined()
      let res2 = await api.post("/auth/register/cliente").set("Authorization", `Bearer ${res.body.token}`).send(nuevoEmpleado).expect(401)
      await pool.query("UPDATE usuario SET rol='admin' WHERE email='admin@gmail.com'")
      res2 = await api.post("/auth/register/cliente").set("Authorization", `Bearer ${res.body.token}`).send(nuevoEmpleado).expect(200)

      // res = await api.post("/auth/login").send(credenciales).expect(200)
    })
  })
})

afterAll(async () => {
  await pool.end()
})