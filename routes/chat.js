import { Router } from "express";
import { checkValidator, extraerUsuario, verificarRol } from "../middlewares.js";
import { conversacionController } from "../controllers/conversacion.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
import { rolesUsuario } from "../controllers/usuario.js"
const chatRouter = Router()

chatRouter.get("/mensajes/:idticket",
  extraerUsuario,
  UUIDParamValidator("idticket"),
  checkValidator,
  conversacionController.obtenerMensajesChat
)

chatRouter.get("/conversacion",
  extraerUsuario,
  checkValidator,
  conversacionController.obtenerConversaciones
)
chatRouter.get("/conversacion/:idticket",
  extraerUsuario,
  UUIDParamValidator("idticket"),
  checkValidator,
  conversacionController.obtenerConversacion
)

export default chatRouter;