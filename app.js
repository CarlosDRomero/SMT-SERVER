import { app } from "./socket/socket.js";
import express from "express"
import "express-async-errors";

import authRouter from "./routes/auth.js";
import domicilioRouter from "./routes/domicilio.js";
import componentesRouter from "./routes/componentes.js";

import { errorHandler } from "./middlewares.js";

//MIDLEWARES INICIALES
app.use(express.json());

//RUTAS

app.use("/auth", authRouter)
app.use("/domicilio", domicilioRouter)
app.use("/componentes", componentesRouter)

//MIDDLEWARES FINALES

app.use(errorHandler);

export default app;