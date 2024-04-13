import { Router } from "express"
import { usuarioController } from "../controllers/usuario.js"
import { registroValidator } from "../validators/registro_validator.js";
import { loginValidator } from "../validators/login_validator.js";
import { checkValidator, claveEncrypt, extraerNombreUsuario, validarUUID } from "../middlewares.js";
import { codigoController } from "../controllers/condigo_verificacion.js";


const authRouter = Router()

authRouter.post("/register",
  registroValidator,
  checkValidator,
  extraerNombreUsuario,
  claveEncrypt,
  usuarioController.registrar,
  codigoController.crearCodigo
);

authRouter.post("/verification/:id", validarUUID, codigoController.validarCodigo, usuarioController.confirmar)

authRouter.post("/login",
  loginValidator,
  checkValidator,
  usuarioController.login,
  codigoController.crearCodigo
)


export default authRouter;