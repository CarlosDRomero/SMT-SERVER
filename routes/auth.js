import { Router } from "express"
import { usuarioController } from "../controllers/usuario.js"
import { usuarioValidator } from "../validators/usuario_validator.js";
import { checkValidator, claveEncrypt, extraerNombreUsuario, validarUUID } from "../middlewares.js";
import { codigoController } from "../controllers/condigo_verificacion.js";


const authRouter = Router()

authRouter.post("/register",
  usuarioValidator,
  checkValidator,
  extraerNombreUsuario,
  claveEncrypt,
  usuarioController.registrar,
  codigoController.crearCodigo
);

authRouter.post("/verification/:id", validarUUID, codigoController.validarCodigo, usuarioController.confirmar
)

export default authRouter;