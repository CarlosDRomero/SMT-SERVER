import supertest from "supertest"
import app from "../app.js"
import { poolClient } from "../database/conexion.js"
import { limpiarTablas } from "./test_helper.js"

import { io as ioc } from "socket.io-client";
import { httpServer } from "../socket/socket.js";

app.removeAllListeners()
let api;
let io, url, jwts, clientSockets;

beforeAll((done) => {


  httpServer.listen(() => {
    const port = httpServer.address().port;
    url = `http://localhost:${port}`
    api = supertest(app)
    done();
  });
});


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


describe("Autenticacion de sockets", () => {

  test("Un canal que solo le permite unirse a los admins", (done) => {
    const cliente = ioc(url, { autoConnect:false, extraHeaders: { authorization: jwts.cliente } })
    cliente.on("connect", () => {
      cliente.disconnect()
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
      cliente.disconnect()
      done();
    })
    cliente.connect();
  })

  test("Un usuario puede notificar a los admins por el canal notificaciones/notificar-compra", (done) => {
    const admin = ioc(url, { extraHeaders: { authorization: jwts.admin } })
    const cliente = ioc(url, { extraHeaders: { authorization: jwts.cliente } })
    admin.on("chat:enviar-mensaje", () => {
      console.log("admin notificado")
    })
    cliente.on("connect", () => {
      cliente.emit("chat:enviar-mensaje", { idconversacion: "ea2d699e-2d0d-4a25-8173-7d82bb742a9f", contenido: "xDDD" }, (m) => {
        console.log("Ejectudao", m)
        expect(m).toEqual("mensaje enviado")
        cliente.disconnect();
        admin.disconnect();
        done()
      })
      

    })

  }, 12000)
  test("Debe haber hasta el momento unos 2 usuario online", async () => {
    const res = await api.get("/auth/onlinetest");
    expect(res.body).toHaveLength(2)
  })
})