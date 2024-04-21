import { Router } from "express"
import { colombiaAPIController } from "../controllers/colombia_api.js";
import { municipioParamValidator } from "../validators/munipicio_validator.js";
import { checkValidator, extraerUsuario, verificarRol } from "../middlewares.js";
import { direccionValidator } from "../validators/direccion_validator.js";
import { domicilioController } from "../controllers/domicilio.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
import { usuarioModel } from "../models/usuario.js";

const domicilioRouter = Router()

domicilioRouter.get("/listaDepartamentos", colombiaAPIController.obtenerDepartamentos);

domicilioRouter.get("/listaMunicipios/:c_departamento", municipioParamValidator, checkValidator, colombiaAPIController.obtenerMunicipiosPorDep);

domicilioRouter
  .post("/direcciones", extraerUsuario, direccionValidator, checkValidator, domicilioController.crearDireccion)  //crear direcciones

  .get("/direcciones",extraerUsuario, domicilioController.obtenerDirecciones) //ver direcciones del usuario

  .put("/direcciones/:iddireccion", extraerUsuario, direccionValidator, UUIDParamValidator("iddireccion"), checkValidator,
    domicilioController.actualizarDireccion) //actualizar direcciones solo la de el

  .delete("/direcciones/:iddireccion", extraerUsuario, UUIDParamValidator("iddireccion"), checkValidator, domicilioController.eliminarDireccion) //eliminar direcciones del usuario

  .get("/direcciones/administrar/:idusuario", extraerUsuario, verificarRol([usuarioModel.roles.ADMIN]), UUIDParamValidator("idusuario"),
    checkValidator, domicilioController.obtenerDireccionesAdmin) //obtener direcciones por id solo siendo admin
 
export default domicilioRouter;