import { body } from "express-validator";

export const productoCarritoValidator = [
  body("cantidad", "La cantidad debe ser un numero valido").isInt({ min:1 }),
]