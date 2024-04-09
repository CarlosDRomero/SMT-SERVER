import { body } from "express-validator";
import { isValidDate } from "./custom_validators.js";

export const usuarioValidator = () => {
    console.log("Iniciando ru")
    return [
      body("nombres", "Nombres no validos").notEmpty(),
      body("apellidos", "Apellidos no validos").notEmpty(),
      body("nombreUsuario", "Nombres Usuario no valido").notEmpty(),
      body("clave", "Clave no valida").notEmpty(),
      body("email", "Email no valido").isEmail(),
      body("fecha_nac", "Fecha Nacimiento no valida").custom(isValidDate),
    ]
  }


