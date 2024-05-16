import { body } from "express-validator";

export const ticketNuevoValidator = [
  body("asunto", "Debe incluir asunto").notEmpty(),
  body("contenido", "Debe incluir una descripcion").notEmpty()
]

export const ticketEmailValidator = [
  body("email", "Email no valido").isEmail().optional()
]

export const ticketProcessValidator = [
  body("idtipo_servicio", "El servicio no es valida").isInt(),
  body("prioridad", "La prioridad del ticket").notEmpty()
]