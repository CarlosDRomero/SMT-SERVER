import { env } from "./environment.js"
import { httpServer } from "./socket/socket.js";
import "./app.js";

httpServer.listen(env.PORT, "0.0.0.0", () => {
  console.log("Server escuchando en puerto " + env.PORT)
  console.log("MODO:",env.NODE_ENV)
});





