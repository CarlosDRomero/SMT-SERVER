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

export const servicioValidator = [
  body("tipo_servicio", "El tipo de servicio no es valido").notEmpty(),
  body("url_imagen", "No es una url valida").isURL(),
  body("descripcion", "No es una descripcion valida").isLength({ min:10 })
]

export const calificacionTicketValidator = [
  body("valor","El valor debe ir de 0 a 5").isInt({ min:1, max:5 }),
  body("comentario","El comentario no debe superar los 500 caracteres").isLength({ max:500 }).optional()
]