import { Router } from "express"
import { usuarioController } from "../controllers/usuario.js"
import { registroValidator } from "../validators/registro_validator.js";
import { loginValidator } from "../validators/login_validator.js";
import { extraerUsuario, verificarRol, checkValidator, claveEncrypt, extraerNombreUsuario, firmarToken, generarCodigo } from "../middlewares.js";
import { codigoController } from "../controllers/codigo_verificacion.js";
import { mailerController } from "../controllers/mailer.js";
import { codigoValidator } from "../validators/codigo_validator.js";
import { usuarioModel } from "../models/usuario.js";
import { UUIDParamValidator } from "../validators/general_validators.js";

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
  extraerUsuario,
  verificarRol([usuarioModel.roles.ADMIN]),
  registroValidator,
  checkValidator,
  extraerNombreUsuario,
  claveEncrypt,
  usuarioController.registrar,
  usuarioController.actualizarRolEmpleado,
  generarCodigo,
  mailerController.mailVerificacion,
  codigoController.crearCodigo

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

authRouter.post("/verification/:id",
  UUIDParamValidator,
  codigoValidator,
  checkValidator,
  codigoController.validarCodigo,
  usuarioController.confirmar,
  firmarToken
)
authRouter.post("/resendcode/:id",
  UUIDParamValidator,
  checkValidator,
  usuarioController.encontrarUsuarioCodigo,
  generarCodigo,
  mailerController.mailVerificacion,
  codigoController.crearCodigo
)

//TODO:IMPORTANTE > RUTA PARA RECUPERACION DE CONTRASEÑA


export default authRouter;