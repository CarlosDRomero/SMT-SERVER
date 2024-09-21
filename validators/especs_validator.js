import { body } from "express-validator";

export const EspecsValidator = [
  body("especificaciones", "El formato de las especificaciones no es valido").isArray().optional(),
  body("especificaciones.*.idespec", "").isNumeric(),
  body("especificaciones.*.valor", "").notEmpty()

]