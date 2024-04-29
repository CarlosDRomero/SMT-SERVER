import { body } from "express-validator";

export const EspecsValidator = [
  body("especificaciones", "El formato de las especificaciones no es valido").isArray().optional(),
  body("especificaciones.*.idcat_espec", "").isNumeric(),
  body("especificaciones.*.valor", "").notEmpty()

]