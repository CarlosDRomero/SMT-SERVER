import express from "express"
import "express-async-errors";
import authRouter from "./routes/auth.js";
import { errorHandler } from "./middlewares.js";

const app = express();
//MIDLEWARES INICIALES
app.use(express.json());

//RUTAS

app.use("/auth", authRouter)

//MIDDLEWARES FINALES

app.use(errorHandler);

export default app;