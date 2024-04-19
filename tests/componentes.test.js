import supertest from "supertest"
import app from "../app"
import { limpiarTablas } from "./test_helper"
import { pool } from "../database/conexion"
import { tokens } from "../services/tokens"

app.removeAllListeners()
const api = supertest(app)

beforeAll(async () => {
  await limpiarTablas();
  console.log("Registrando usuario de testeo");
  await api.post("/auth/register").send({
    nombres: "Test",
    apellidos: "Test Man",
    clave: "test",
    email: "testing@tests.test.t.com",
    fecha_nac: "2003-06-06"
  })
  await pool.query("UPDATE usuario SET confirmado=true WHERE email='testing@tests.test.t.com'")

  await api.post("/auth/register").send({
    nombres: "Test",
    apellidos: "Test O=ther",
    clave: "test",
    email: "testing2@tests.test.t.com",
    fecha_nac: "2003-06-06"
  })
  await pool.query("UPDATE usuario SET confirmado=true WHERE email='testing2@tests.test.t.com'")

  console.log("Registrando usuario admin");
  await api.post("/auth/register").send({
    nombres: "Admin",
    apellidos: "Admin Man",
    clave: "admin",
    email: "admin@tests.test.t.com",
    fecha_nac: "2003-06-06"
  })
  await pool.query("UPDATE usuario SET confirmado=true, rol='admin' WHERE email='admin@tests.test.t.com'")
})

describe("Componentes para los clientes", () => {
  
})
describe("Componentes para los admins/empleados",() => {

})