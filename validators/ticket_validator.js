import { body } from "express-validator";

export const ticketNuevoValidator = [
  body("email", "Email no valido").isEmail(),
  body("asunto", "Debe incluir asunto").notEmpty(),
  body("contenido", "Debe incluir una descripcion").notEmpty()
]
export const ticketProcessValidator = [
  body("idclasificacion", "La clasificacion no es valida").isInt(),
  body("prioridad", "La prioridad del ticket").notEmpty()
]