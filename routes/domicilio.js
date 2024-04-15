import { Router } from "express"
import { colombiaAPIController } from "../controllers/colombia_api.js";

//TODO:IMPORTANTE >  Obtener municipio segun codigo departamento, codigo que pase por el body o parametro de la URL

export const domicilioRouter = Router()

domicilioRouter.get("/listaDepartamentos", colombiaAPIController.obtenerDepartamentos);