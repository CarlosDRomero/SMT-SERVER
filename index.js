import express from "express"
import { env } from "./environment.js"
import "express-async-errors";
import usuarioRouter from "./routes/usuario.js";
import { errorHandler } from "./middlewares.js";

const app = express();

//MIDLEWARES INICIALES
app.use(express.json());

//RUTAS

app.use("/auth", usuarioRouter)

//MIDDLEWARES FINALES

app.use(errorHandler);


app.listen(env.PORT, () => {
  console.log("Server escuchando en puerto " + env.PORT)
});

export default app;




