import { body } from "express-validator";

export const ComponenteValidator = [
  body("idcategoria", "Id de la categoria no valida").isNumeric(),
  body("marca", "El componente necesita una descripcion").notEmpty(),
  body("nombre", "El componente necesita una descripcion").notEmpty(),
  body("descripcion", "El componente necesita una descripcion").notEmpty(),
  body("url_imagen", "La imagen debe ser una URL").isURL()

]