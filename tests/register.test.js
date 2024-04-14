import supertest from "supertest"
import app from "../app.js"
import { pool } from "../database/conexion.js"
import { limpiarTablas } from "./test_helper.js"
import isUUID from "uuid-validate"

const api = supertest(app)

beforeAll(async () => {
  await limpiarTablas()
})


describe("tests de ruta /auth/register", () => {
  test("POST de datos incorrectos es status 400 y responde con errores", async () => {
    const res = await api.post("/auth/register").send({
      "clave": "12345",
      "nombres": "Carlos",
      "apellidos": "",
      "nombreUsuario": "qwer",
      "email": "qwergmail.com",
      "fecha_nac": "2003-0808"
    }).expect(400)
    expect(res.body.errors).toBeDefined()
    expect(res.body.errors).toHaveLength(3)
    
  })
  test("POST con datos correctos genera un codigo de verificacion", async () => {
    const apires = await api.post("/auth/register").send({
      "clave": "12345",
      "nombres": "Carlos",
      "apellidos": "Romero",
      "email": "qwer@tests.test.t.com",
      "fecha_nac": "2003-08-08"
    }).expect(200)
    
    expect(apires.body.verificationId).toBeDefined();
    expect(isUUID(apires.body.verificationId)).toEqual(true);
    let result = await pool.query("SELECT * FROM usuario WHERE email='qwer@tests.test.t.com'")
    expect(result.rows[0].nombre_usuario).toEqual("qwer")
    expect(result.rows[0].confirmado).toEqual(false)
    expect(result.rows[0].rol).toEqual("cliente")
  
    result =  await pool.query(`SELECT * FROM codigo_verificacion WHERE idusuario='${result.rows[0].idusuario}'`)
  
    expect(result.rows[0]).toBeDefined()
  })
  
  test("Un usuario que nunca ha confirmado puede hacer su registro como si fuera la primer vez", async () => {
    await limpiarTablas();

    await api.post("/auth/register").send({
      "clave": "12345",
      "nombres": "Carlos",
      "apellidos": "Romero",
      "nombreUsuario": "usuario",
      "email": "qwer@tests.test.t.com",
      "fecha_nac": "2003-08-08"
    }).expect(200)
  
    let result = await pool.query("SELECT * FROM usuario WHERE email='qwer@tests.test.t.com'")
    expect(result.rows[0].nombres).toEqual("Carlos")
    expect(result.rows[0].confirmado).toEqual(false)
    expect(result.rows[0].fecha_confirmado).toBeNull()
    result =  await pool.query(`SELECT * FROM codigo_verificacion WHERE idusuario='${result.rows[0].idusuario}'`)
  
    await api.post("/auth/register").send({
      "clave": "12345",
      "nombres": "Carlos",
      "apellidos": "Romero",
      "nombreUsuario": "usuario",
      "email": "qwer@tests.test.t.com",
      "fecha_nac": "2003-08-08"
    }).expect(200)
    result = await pool.query("SELECT * FROM usuario WHERE email='qwer@tests.test.t.com'")
    expect(result.rows[0].nombre_usuario).toEqual("qwer")
    expect(result.rows[0].confirmado).toEqual(false)
    result =  await pool.query(`SELECT * FROM codigo_verificacion WHERE idusuario='${result.rows[0].idusuario}'`)
  
    expect(result).toBeDefined()
  })

  test("Un usuario ya confirmado no podra volverse a registrar en la base de datos", async () => {
    await limpiarTablas();

    await api.post("/auth/register").send({
      "clave": "12345",
      "nombres": "Carlos",
      "apellidos": "Romero",
      "nombreUsuario": "usuario",
      "email": "qwer@tests.test.t.com",
      "fecha_nac": "2003-08-08"
    }).expect(200)
  
    let result = await pool.query("UPDATE usuario SET confirmado=true WHERE email='qwer@tests.test.t.com' RETURNING *")
    expect(result.rows[0].nombres).toEqual("Carlos")
    expect(result.rows[0].confirmado).toEqual(true)
    result =  await pool.query(`SELECT * FROM codigo_verificacion WHERE idusuario='${result.rows[0].idusuario}'`)

    expect(result.rows[0]).toBeUndefined()
    await api.post("/auth/register").send({
      "clave": "12345",
      "nombres": "Carlos",
      "apellidos": "Romero",
      "email": "qwer@tests.test.t.com",
      "fecha_nac": "2003-08-08"
    }).expect(409)
    result = await pool.query("SELECT * FROM usuario WHERE email='qwer@tests.test.t.com'")
    expect(result.rows[0].nombres).toEqual("Carlos")
    expect(result.rows[0].confirmado).toEqual(true)
    result =  await pool.query(`SELECT * FROM codigo_verificacion WHERE idusuario='${result.rows[0].idusuario}'`)
  
    expect(result.rows[0]).toBeUndefined()
  })
})



afterAll(async () => {
  await limpiarTablas();
  await pool.end()
})
