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
import chatEvents from "./events/chat.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer,{
  cors: "*"
})
//TODO: funciones para comprobar online
io.use(expressMiddlewareAdapter(extraerUsuario))

io.on("connection", socket => {
  const usuario = socket.handshake.usuario;
  console.log(`${usuario.nombre_usuario} se ha conectado`)
  socket.emit("cambio-en-online")
  unirAOnline(socket, usuario.idusuario)
  unirSalaRol(socket, usuario.rol)
  useEvents(socket, "chat", chatEvents)
  
  socket.on("disconnect", (r) => {
    seDesconecta(socket,usuario.idusuario);
  })

  socket.on("error", (e) => {
    console.log("Error: ", e);
  })
})
console.log("socket.io is ready")

export { app, httpServer, io }