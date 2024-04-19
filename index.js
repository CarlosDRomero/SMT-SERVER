import { env } from "./environment.js"
import { httpServer } from "./socket/socket.js";
import "./app.js";

httpServer.listen(env.PORT, () => {
  console.log("Server escuchando en puerto " + env.PORT)
});





