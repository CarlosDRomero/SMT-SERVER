import { body } from "express-validator";

export const ComponenteValidator = [
  body("idcategoria", "Id de la categoria no valida").isNumeric(),
  body("marca", "El componente necesita una descripcion").notEmpty(),
  body("nombre", "El componente necesita una descripcion").notEmpty(),
  body("descripcion", "El componente necesita una descripcion").notEmpty(),
  body("url_imagen", "La imagen debe ser una URL").isURL(),
  body("especificaciones", "El formato de las especificaciones no es valido").isArray().optional(),
  body("especificaciones.*.idcat_espec", "").isNumeric(),
  body("especificaciones.*.valor", "").notEmpty()

]