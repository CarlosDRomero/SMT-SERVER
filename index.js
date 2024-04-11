import { env } from "./environment.js"
import app from "./app.js";

app.listen(env.PORT, () => {
  console.log("Server escuchando en puerto " + env.PORT)
});





