import { param } from "express-validator";

export const UUIDParamValidator = (...paraValidar) => {
  if (paraValidar.length === 0) paraValidar.push("id")
  return paraValidar.map(p => param(p, "No se envio un valor valido").isUUID())
  
}

export const NumberParamValidator = (...paraValidar) => {
  if (paraValidar.length === 0) paraValidar.push("id")
  return paraValidar.map(p => param(p, "No se envio un valor valido").not().isEmpty())
}