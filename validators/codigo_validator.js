import { body } from "express-validator";

export const codigoValidator = [
  body("codigo", "Codigo no valido o incompleto").isLength({ min: 6, max:6 })
]