import { Router } from "express"
import { colombiaAPIController } from "../controllers/colombia_api.js";
import { municipioParamValidator } from "../validators/munipicio_validator.js";
import { checkValidator, extraerUsuario, gestionarUsuario, verificarRol } from "../middlewares.js";
import { direccionValidator } from "../validators/direccion_validator.js";
import { domicilioController } from "../controllers/domicilio.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
import { rolesUsuario } from "../controllers/usuario.js";

const domicilioRouter = Router()

domicilioRouter.get("/listaDepartamentos", colombiaAPIController.obtenerDepartamentos);

domicilioRouter.get("/listaMunicipios/:c_departamento",
  municipioParamValidator,
  checkValidator,
  colombiaAPIController.obtenerMunicipiosPorDep
);

domicilioRouter
  .post("/direcciones",
    extraerUsuario,
    direccionValidator,
    checkValidator,
    domicilioController.crearDireccion
  )  //crear direcciones
  .get("/direcciones",
    extraerUsuario,
    domicilioController.obtenerDireccion
  ) //ver direcciones del usuario

  .put("/direcciones/:iddireccion",
    extraerUsuario,
    UUIDParamValidator("iddireccion"),
    direccionValidator,
    checkValidator,
    domicilioController.actualizarDireccion
  ) //actualizar direcciones solo la de el

  .delete("/direcciones/:iddireccion",
    extraerUsuario,
    UUIDParamValidator("iddireccion"),
    checkValidator,
    domicilioController.eliminarDireccion
  ) //eliminar direcciones del usuario

  .get("/direcciones/administrar/:idusuario",
    extraerUsuario,
    verificarRol([rolesUsuario.ADMIN]),
    UUIDParamValidator("idusuario"),
    checkValidator,
    gestionarUsuario,
    domicilioController.obtenerDireccion
  ) //obtener direcciones por id solo siendo admin

  .post("/direcciones/administrar/:idusuario",
    extraerUsuario,
    verificarRol([rolesUsuario.ADMIN]),
    direccionValidator,
    UUIDParamValidator("idusuario"),
    checkValidator,
    gestionarUsuario,
    domicilioController.crearDireccion
  )

  .put("/direcciones/administrar/:idusuario/:iddireccion",
    extraerUsuario,
    verificarRol([rolesUsuario.ADMIN]),
    UUIDParamValidator("idusuario", "iddireccion"),
    direccionValidator,
    checkValidator,
    gestionarUsuario,
    domicilioController.actualizarDireccion
  )

  .delete("/direcciones/administrar/:idusuario/:iddireccion",
    extraerUsuario,
    verificarRol([rolesUsuario.ADMIN]),
    UUIDParamValidator("idusuario", "iddireccion"),
    checkValidator,
    gestionarUsuario,
    domicilioController.eliminarDireccion
  )

  

 
export default domicilioRouter;