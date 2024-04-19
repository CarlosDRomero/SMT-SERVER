import { param } from "express-validator";

//TODO:IMPORTANTE > hacer la funcion general para validar los parametros que deban ser uuids
export const UUIDParamValidator = [
  param("id", "No se envio un valor valido").isUUID()
]