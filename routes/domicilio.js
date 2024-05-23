import { Router } from "express"
import { colombiaAPIController } from "../controllers/colombia_api.js";
import { municipioParamValidator } from "../validators/munipicio_validator.js";
import { checkValidator, extraerUsuario, gestionarUsuario, verificarRol, redireccionPorRol } from "../middlewares.js";
import { direccionValidator } from "../validators/direccion_validator.js";
import { domicilioController } from "../controllers/domicilio.js";
import { NumberParamValidator, UUIDParamValidator } from "../validators/general_validators.js";
import { rolesUsuario } from "../controllers/usuario.js";

const domicilioRouter = Router()

domicilioRouter.get("/listaDepartamentos", colombiaAPIController.obtenerDepartamentos);

domicilioRouter.get("/listaMunicipios/:c_departamento",
  municipioParamValidator,
  checkValidator,
  colombiaAPIController.obtenerMunicipiosPorDep
);

domicilioRouter.get("/departamento-municipio/:c_municipio",
  NumberParamValidator("c_municipio"),
  checkValidator,
  colombiaAPIController.obtenerDepartamentoMunicipio
);

domicilioRouter
  .post("/direcciones",
    extraerUsuario,
    verificarRol([rolesUsuario.CLIENTE]),
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
    redireccionPorRol([rolesUsuario.ADMIN], "/domicilio/direcciones/", ["idusuario"]),
    UUIDParamValidator("idusuario"),
    checkValidator,
    gestionarUsuario("cliente"),
    domicilioController.obtenerDireccion
  ) //obtener direcciones por id solo siendo admin

  .post("/direcciones/administrar/:idusuario",
    extraerUsuario,
    redireccionPorRol([rolesUsuario.ADMIN], "/domicilio/direcciones/", ["idusuario"]),
    direccionValidator,
    UUIDParamValidator("idusuario"),
    checkValidator,
    gestionarUsuario("cliente"),
    domicilioController.crearDireccion
  )

  .put("/direcciones/administrar/:idusuario/:iddireccion",
    extraerUsuario,
    redireccionPorRol([rolesUsuario.ADMIN], "/domicilio/direcciones/", ["idusuario"]),
    UUIDParamValidator("idusuario", "iddireccion"),
    direccionValidator,
    checkValidator,
    gestionarUsuario("cliente"),
    domicilioController.actualizarDireccion
  )

  .delete("/direcciones/administrar/:idusuario/:iddireccion",
    extraerUsuario,
    redireccionPorRol([rolesUsuario.ADMIN], "/domicilio/direcciones/", ["idusuario"]),
    UUIDParamValidator("idusuario", "iddireccion"),
    checkValidator,
    gestionarUsuario("cliente"),
    domicilioController.eliminarDireccion
  )
  .get("/direcciones/hacer-predeterminada/:iddireccion",
    extraerUsuario,
    verificarRol([rolesUsuario.CLIENTE]),
    UUIDParamValidator("iddireccion"),
    checkValidator,
    domicilioController.actualizarPredeterminada
  )
  .get("/direcciones/administrar/hacer-predeterminada/:idusuario/:iddireccion",
    extraerUsuario,
    redireccionPorRol([rolesUsuario.ADMIN], "/domicilio/direcciones/hacer-predeterminada/", ["idusuario"]),
    UUIDParamValidator("iddireccion", "idusuario"),
    checkValidator,
    gestionarUsuario("cliente"),
    domicilioController.actualizarPredeterminada
  )


  

 
export default domicilioRouter;