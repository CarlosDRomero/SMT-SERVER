import { body, param } from "express-validator";
import { fecha_validator,RolValidator } from "./custom/index.js";


export const registroValidator = [
  body("nombres", "Nombres no validos").notEmpty(),
  body("apellidos", "Apellidos no validos").notEmpty(),
  body("clave", "Clave no valida").notEmpty(),
  body("email", "Email no valido").isEmail(),
  body("fecha_nac", "Fecha Nacimiento no valida").custom(fecha_validator),
  param("rol", "Este no es un rol valido").custom(RolValidator).optional()
]


