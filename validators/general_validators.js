import { param } from "express-validator";

export const UUIDParamValidator = [
  param("id", "No se envio un valor valido").isUUID()
]