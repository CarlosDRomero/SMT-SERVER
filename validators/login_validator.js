import { body } from "express-validator";

export const loginValidator = [
  body("clave", "Clave no valida").notEmpty(),
  body("email", "Email no valido").isEmail()
]