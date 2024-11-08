import { body, } from "express-validator";
import { fecha_validator } from "./custom/index.js";



export const OfertaValidator = [
  body("asunto", "El asunto no puede superar los 70 carácteres").isLength({ min: 1, max: 70 }),
  body("descripcion", "La oferta necesita una descripcion").notEmpty(),
  body("porcentaje", "El porcentaje debe ser un número entre 0 y 1").isFloat({ gt: 0, max: 100 }),
  body("idcategoria", "La id de la categoria no es válida").optional().isInt({ min: 1 }),
  body("idproducto", "La id del producto no es válida").optional().isUUID(),
  body(["fecha_inicio", "fecha_fin"], "La fecha de inicio es obligatoria").custom(fecha_validator),
  body(".", "La fecha fin no puede superar a la fecha de inicio").custom((reqBody) => {
    const fecha_inicio = new Date(reqBody.fecha_inicio)
    const fecha_fin = new Date(reqBody.fecha_fin)
    return fecha_inicio < fecha_fin;
  }),
  body(".", "No puede enviarse id de categoria si hay id de producto y viceversa").custom((reqBody) => {
    return !!reqBody.idcategoria !== !!reqBody.idproducto;
  })
]

export const CuponValidator = [
  body("asunto", "El asunto no puede superar los 70 carácteres").isLength({ min: 1, max: 70 }),
  body("descripcion", "La oferta necesita una descripcion").notEmpty(),
  body("porcentaje", "El porcentaje debe ser un número entre 0 y 1").optional().isInt({ gt: 0, max: 100 }),
  body("cantidad", "La cantidad debe ser al menos mayor a 1000").optional().isInt({ min: 1000 }),
  body("duracion", "Debe durar al menos un día").isInt({ min: 1 }),
  body("min_compras", "El minimo de compras debe ser mayor a 0").optional().isInt({ min: 0 }),
  body("min_gastado", "El minimo gastado debe ser mayor a 0").optional().isInt({ min: 0 }),
  body(".", "El cupon debe valer o por una cantidad o por un porcentaje").custom((reqBody) => {
    return !!reqBody.duracion !== !!reqBody.cantidad;
  })
]