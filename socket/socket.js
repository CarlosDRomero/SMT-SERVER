import { Server } from "socket.io";
import { createServer } from "http"
import express from "express"
import { expressMiddlewareAdapter, useEvents } from "./utilidades.js";
import { extraerUsuario } from "../middlewares.js";
import notificationEvents from "./events/notificaciones.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer)
//TODO: funciones para comprobar online
io.use(expressMiddlewareAdapter(extraerUsuario))

io.on("connection", socket => {
  const usuario = socket.handshake.usuario;
  socket.join(usuario.idusuario)
  
  if (usuario.rol === "admin" || usuario.rol === "empleado"){
    console.log("uniendo " + usuario.rol + " a sala")
    socket.join(usuario.rol)
  }

  useEvents(socket, "notificaciones", notificationEvents)
  console.log("BIENVENIDO: ", usuario.nombre_usuario)
  socket.use(([event, ...data], next) => {

    if (!event.startsWith("notificaciones/")){
      return next({ name: "TEST", message: "XD", data: data[0] })
    }
    next()
  })
  socket.on("error", (e) => {
    console.log("Error: ", e);
  })
})
console.log("socket.io is ready")

export { app, httpServer, io }