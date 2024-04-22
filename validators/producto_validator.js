import { body } from "express-validator";

export const ProductoValidator = [
  body("sku", "SKU no valido").notEmpty(),
  body("disponibilidad", "Envia un valor numerico").isNumeric(),
  body("precio", "Envia un valor numerico").isNumeric()
]