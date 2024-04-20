import { body } from "express-validator";

export const direccionValidator = [
    body("idusuario","ID no valido").isUUID(),
    body("c_dane_departamento","No se ingreso un departamento de la lista").notEmpty(),
    body("c_dane_municipio", "No se ingreso un municipio de la lista").notEmpty(),
    body("barrio", "Barrio no valido").notEmpty(),
    body("cadena_direccion", "Direccion no valida").notEmpty(),
]