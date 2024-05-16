import { Router } from "express";
import { checkValidator, extraerUsuario } from "../middlewares.js";
import { conversacionController } from "../controllers/conversacion.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
const chatRouter = Router()

chatRouter.get("/mensajes/:idticket",
  extraerUsuario,
  UUIDParamValidator("idticket"),
  checkValidator,
  conversacionController.obtenerMensajesChat
)

export default chatRouter;