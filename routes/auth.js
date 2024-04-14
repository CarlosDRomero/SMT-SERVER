import { Router } from "express"
import { usuarioController } from "../controllers/usuario.js"
import { registroValidator } from "../validators/registro_validator.js";
import { loginValidator } from "../validators/login_validator.js";
import { checkAuth, checkRoleAuth, checkValidator, claveEncrypt, extraerNombreUsuario, firmarToken, generarCodigo, validarUUID } from "../middlewares.js";
import { codigoController } from "../controllers/condigo_verificacion.js";
import { mailerController } from "../controllers/mailer.js";

const authRouter = Router()

authRouter.post("/register",
  registroValidator,
  checkValidator,
  extraerNombreUsuario,
  claveEncrypt,
  usuarioController.registrar,
  generarCodigo,
  mailerController.mailVerificacion,
  codigoController.crearCodigo
);

authRouter.post("/register/empleado",
  checkAuth,
  checkRoleAuth(['admin']),

)


authRouter.post("/login",
  loginValidator,
  checkValidator,
  usuarioController.login,
  firmarToken,
  generarCodigo,
  mailerController.mailVerificacion,
  codigoController.crearCodigo
)
//TODO: IMPORTANTE > VALIDATOR PARA VALIDAR QUE SE MANDE UNA CADENA DE TEXTO "CODIGO" EN EL BODY
authRouter.post("/verification/:id",
  validarUUID,
  codigoController.validarCodigo,
  usuarioController.confirmar,
  firmarToken
)
authRouter.post("/resendcode/:id",
  validarUUID,
  usuarioController.encontrarUsuarioCodigo,
  generarCodigo,
  mailerController.mailVerificacion,
  codigoController.crearCodigo
)



export default authRouter;