import { Router } from "express"
import { rolesUsuario, usuarioController } from "../controllers/usuario.js"
import { registroValidator } from "../validators/registro_validator.js";
import { loginValidator } from "../validators/login_validator.js";
import { extraerUsuario, verificarRol, checkValidator, claveEncrypt, extraerNombreUsuario, firmarToken, generarCodigo, checkNoExtraFields } from "../middlewares.js";
import { codigoController } from "../controllers/codigo_verificacion.js";
import { mailerController } from "../controllers/mailer.js";
import { codigoValidator } from "../validators/codigo_validator.js";
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

authRouter.post("/register/:rol",
  extraerUsuario,
  verificarRol([rolesUsuario.ADMIN]),
  registroValidator,
  checkValidator,
  extraerNombreUsuario,
  claveEncrypt,
  usuarioController.registrar,
  usuarioController.actualizarRol,
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
  UUIDParamValidator(),
  codigoValidator,
  checkValidator,
  codigoController.validarCodigo,
  usuarioController.confirmar,
  firmarToken
)
authRouter.get("/resendcode/:id",
  UUIDParamValidator(),
  checkValidator,
  usuarioController.encontrarUsuarioCodigo,
  generarCodigo,
  mailerController.mailVerificacion,
  codigoController.crearCodigo
)
authRouter.get("/rol", extraerUsuario, usuarioController.obtenerRol)
authRouter.get("/validar-sesion", extraerUsuario, (_,res) => res.send())

authRouter.get("/online", extraerUsuario, usuarioController.obtenerOnline)

//TODO:IMPORTANTE > RUTA PARA RECUPERACION DE CONTRASEÑA


export default authRouter;