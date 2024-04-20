import { Router } from "express"
import { colombiaAPIController } from "../controllers/colombia_api.js";
import { municipioParamValidator } from "../validators/munipicio_validator.js";
import { checkValidator, extraerUsuario } from "../middlewares.js";
import { direccionValidator } from "../validators/direccion_validator.js";
import { domicilioController } from "../controllers/domicilio.js";

//TODO:IMPORTANTE >  Obtener municipio segun codigo departamento, codigo que pase por el body o parametro de la URL

const domicilioRouter = Router()

domicilioRouter.get("/listaDepartamentos", colombiaAPIController.obtenerDepartamentos);

domicilioRouter.get("/listaMunicipios/:c_departamento",
  municipioParamValidator,
  checkValidator,
  colombiaAPIController.obtenerMunicipiosPorDep
);


    

domicilioRouter
    .post("/direcciones", extraerUsuario, direccionValidator, checkValidator, domicilioController.crearDireccion)  //crear direcciones

    .get("/direcciones",extraerUsuario, domicilioController.obtenerDireccionesUsuario) //ver direcciones del usuario

    .put("/direcciones/:id") //actualizar direcciones solo la de el

    .delete("/direcciones/:id") //eliminar direcciones del usuario solo la de el

    .get("/direcciones/administrar:id") //obtener direcciones por id solo siendo admin

    export default domicilioRouter;