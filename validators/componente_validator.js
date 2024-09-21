import { body } from "express-validator";

export const ProductoValidator = [
  body("idcategoria", "Id de la categoria no valida").isNumeric(),
  body("marca", "El producto necesita una descripcion").notEmpty(),
  body("nombre", "El producto necesita una descripcion").notEmpty(),
  body("disponibilidad", "La disponibilidad del producto deberia ser un numero").isNumeric(),
  body("precio", "El precio del producto debe ser un numero").isNumeric(),
  body("descripcion", "El producto necesita una descripcion").notEmpty(),
  body("url_imagen", "La imagen debe ser una URL").isURL()

]