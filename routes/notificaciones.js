import { Router } from "express";
import { notificacionController } from "../controllers/notificacion.js";
import { checkValidator, extraerUsuario } from "../middlewares.js";
import { UUIDParamValidator } from "../validators/general_validators.js";

const notificacionesRouter = Router()

notificacionesRouter.get("/", extraerUsuario, notificacionController.obtenerNotificacionesUsuario)
notificacionesRouter.post("/marcar-vista/:idnotificacion",
  extraerUsuario,
  UUIDParamValidator("idnotificacion"),
  checkValidator,
  notificacionController.actualizarVista
)

export default notificacionesRouter;