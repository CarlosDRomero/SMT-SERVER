import { body } from "express-validator";
import { fecha_validator } from "./custom/fecha_validator.js";

export const usuarioValidator = [
  body("nombres", "Nombres no validos").notEmpty(),
  body("apellidos", "Apellidos no validos").notEmpty(),
  body("nombreUsuario", "Nombres Usuario no valido").notEmpty(),
  body("clave", "Clave no valida").notEmpty(),
  body("email", "Email no valido").isEmail(),
  body("fecha_nac", "Fecha Nacimiento no valida").custom(fecha_validator),
]


