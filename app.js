import { app } from "./socket/socket.js";
import express from "express"
import "express-async-errors";
import cors from "cors"

import authRouter from "./routes/auth.js";
import domicilioRouter from "./routes/domicilio.js";
import componentesRouter from "./routes/componentes.js";
import ticketRouter from "./routes/ticket.js";
import notificacionesRouter from "./routes/notificaciones.js";

import { errorHandler } from "./middlewares.js";


import "./devdefault.js"
import tiendaRouter from "./routes/tienda.js";
import chatRouter from "./routes/chat.js";


//MIDLEWARES INICIALES
app.use(express.json());
app.use(cors());

//RUTAS

app.use("/auth", authRouter)
app.use("/domicilio", domicilioRouter)
app.use("/componentes", componentesRouter)
app.use("/tickets", ticketRouter)
app.use("/tienda", tiendaRouter)
app.use("/notificaciones", notificacionesRouter)
app.use("/chat", chatRouter)

//MIDDLEWARES FINALES

app.use(errorHandler);

export default app;