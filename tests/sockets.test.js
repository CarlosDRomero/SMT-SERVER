import supertest from "supertest"
import app from "../app.js"
import { poolClient } from "../database/conexion.js"
import { limpiarTablas } from "./test_helper.js"

import { io as ioc } from "socket.io-client";
import { httpServer } from "../socket/socket.js";

app.removeAllListeners()
const api = supertest(app)
let io, url, jwts, clientSockets;



beforeAll(async () => {
  await limpiarTablas();
  console.log("Registrando usuario de testeo");

  await api.post("/auth/register").send({
    nombres: "Cliente",
    apellidos: "Clienter",
    clave: "client",
    email: "cliente@tests.com",
    fecha_nac: "2003-06-06"
  })
  await poolClient.query("UPDATE usuario SET confirmado=true WHERE email='cliente@tests.com'")

  await api.post("/auth/register").send({
    nombres: "empleado",
    apellidos: "Ese",
    clave: "empleado",
    email: "empleado@tests.com",
    fecha_nac: "2003-06-06"
  })
  await poolClient.query("UPDATE usuario SET confirmado=true WHERE email='empleado@tests.com'")

  console.log("Registrando usuario admin");
  await api.post("/auth/register").send({
    nombres: "Admin",
    apellidos: "Admin Man",
    clave: "admin",
    email: "admin@tests.com",
    fecha_nac: "2003-06-06"
  })
  await poolClient.query("UPDATE usuario SET confirmado=true, rol='admin' WHERE email='admin@tests.com'")

  const cliente = await api.post("/auth/login").send({ clave: "client",email: "cliente@tests.com" })
  const empleado = await api.post("/auth/login").send({ clave: "empleado",email: "empleado@tests.com" })
  const admin = await api.post("/auth/login").send({ clave: "admin",email: "admin@tests.com" })
  jwts = { cliente: cliente.body.token, empleado: empleado.body.token, admin: admin.body.token }
  
})

beforeAll((done) => {


  httpServer.listen(() => {
    const port = httpServer.address().port;
    url = `http://localhost:${port}`
    
    done();
  });
});

describe("Autenticacion de sockets", () => {

  test("Un canal que solo le permite unirse a los admins", (done) => {
    const cliente = ioc(url, { autoConnect:false, extraHeaders: { authorization: jwts.cliente } })
    cliente.on("connect", () => {
      done();
    })
    cliente.connect();
  })
  test("Un usuario sin un jwt valido no puede conectarse al servicio de sockets", (done) => {
    const cliente = ioc(
      url,
      {
        autoConnect:false,
        extraHeaders:
          {
            authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
          }
      }
    )
    cliente.on("connect_error", (e) => {
      expect(e).toBeDefined();
      expect(e.message).toEqual(expect.any(String))
      expect(e.message.toLowerCase()).toContain("no es valido")
      
      done();
    })
    cliente.connect();
  })

  test("Un usuario puede notificar a los admins por el canal notificaciones/notificar-compra", (done) => {
    const admin = ioc(url, { extraHeaders: { authorization: jwts.admin } })
    const cliente = ioc(url, { extraHeaders: { authorization: jwts.cliente } })
    admin.on("notificaciones/notificar-compra", () => {
      console.log("admin notificado")
      done()
    })
    cliente.on("connect", () => {
      cliente.emit("notificaciones/notificar-compra", (m) => {
        expect(m).toEqual("Compra confirmada")
      })
      

    })


  }, 12000)
})