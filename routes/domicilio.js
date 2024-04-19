import { Router } from "express"
import { colombiaAPIController } from "../controllers/colombia_api.js";
import { municipioParamValidator } from "../validators/munipicio_validator.js";
import { checkValidator } from "../middlewares.js";

//TODO:IMPORTANTE >  Obtener municipio segun codigo departamento, codigo que pase por el body o parametro de la URL

export const domicilioRouter = Router()

domicilioRouter.get("/listaDepartamentos", colombiaAPIController.obtenerDepartamentos);

domicilioRouter.get("/listaMunicipios/:c_departamento", 
    municipioParamValidator,
    checkValidator,
    colombiaAPIController.obtenerMunicipiosPorDep
);

domicilioRouter.post("/direccion",

);