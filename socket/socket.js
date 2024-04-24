import { Server } from "socket.io";
import { createServer } from "http"
import express from "express"
import {
  expressMiddlewareAdapter,
  seDesconecta,
  unirAOnline,
  unirSalaRol,
  useEvents } from "./utilidades.js";

import { extraerUsuario } from "../middlewares.js";
import notificationEvents from "./events/notificaciones.js";
import { salas } from "./commons.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer)
//TODO: funciones para comprobar online
io.use(expressMiddlewareAdapter(extraerUsuario))

io.on("connection", socket => {
  const usuario = socket.handshake.usuario;
  unirAOnline(socket, usuario.idusuario)
  unirSalaRol(socket, usuario.rol)

  useEvents(socket, "notificaciones", notificationEvents)

  socket.on("disconnect", (r) => {
    seDesconecta(usuario.idusuario);
  })
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