import express from "express"
import { env } from "./environment.js"
import usuarioRouter from "./routes/usuario.js";
import "express-async-errors";
import { errorHandler } from "./middlewares.js";

const app = express();

//MIDLEWARES INICIALES
app.use(express.json());

//RUTAS

app.use("/register", usuarioRouter)

//MIDDLEWARES FINALES

app.use(errorHandler);


app.listen(env.PORT, () => {
  console.log("Server escuchando en puerto "+ env.PORT)
});





