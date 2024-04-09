import supertest from "supertest"
import app from "../index.js"
import { pool } from "../database/database.js"
const api = supertest(app)



test("Si se pasa un dato incorrecto se devuelve un error 400", async () => {
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

test("Si se envia un valor valido estará en la base de datos", async () => {
  await api.post("/auth/register").send({
    "clave": "12345",
    "nombres": "Carlos",
    "apellidos": "Romero",
    "nombreUsuario": "usuario",
    "email": "qwer@gmail.com",
    "fecha_nac": "2003-08-08"
  }).expect(200)

  const result =  await pool.query("SELECT * FROM usuario fetch first 1 row only")
  expect(result.rows[0].nombres).toEqual("Carlos")
})

afterAll(async () => {
  console.log("closing database connection")
  await pool.end()
})
