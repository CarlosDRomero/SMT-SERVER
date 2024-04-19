import { param } from "express-validator";

export const municipioParamValidator = [
    param("c_departamento", "No se ingreso un departamento de la lista").notEmpty()
  ]