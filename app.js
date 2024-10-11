import { app } from "./socket/socket.js";
import express from "express"
import "express-async-errors";
import cors from "cors"

import authRouter from "./routes/auth.js";
import domicilioRouter from "./routes/domicilio.js";
import productosRouter from "./routes/productos.js";
import ticketRouter from "./routes/ticket.js";
import notificacionesRouter from "./routes/notificaciones.js";

import { errorHandler, parsePagingHeader } from "./middlewares.js";


import "./devdefault.js"
import tiendaRouter from "./routes/tienda.js";
import chatRouter from "./routes/chat.js";
import { env } from "./environment.js";

const corsOptions = {
  origin: env.FRONTEND_ORIGIN, // Replace with your allowed origin
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

//MIDLEWARES INICIALES
app.use(express.json());
app.use(cors(corsOptions));
app.use(parsePagingHeader)

//RUTAS

app.use("/auth", authRouter)
app.use("/domicilio", domicilioRouter)
app.use("/productos", productosRouter)
app.use("/tickets", ticketRouter)
app.use("/tienda", tiendaRouter)
app.use("/notificaciones", notificacionesRouter)
app.use("/chat", chatRouter)

//MIDDLEWARES FINALES

app.use(errorHandler);

export default app;