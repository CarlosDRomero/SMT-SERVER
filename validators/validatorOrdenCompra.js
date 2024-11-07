import { body } from "express-validator";

export const validatorOrdenCompra = [
  body("iddireccion", "No es una dirección valida").optional().isUUID(),
  body("idcupon", "No es un cupón valido").optional().isUUID(),
  body("productos", "La lista no es valida").isArray(),
  body("productos.*.idproducto", "").isUUID(),
  body("productos.*.cantidad", "").isInt({ min:1 }),
]