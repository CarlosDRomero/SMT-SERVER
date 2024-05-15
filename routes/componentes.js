import { Router } from "express"
import { checkNoExtraFields, checkValidator, extraerUsuario, verificarRol } from "../middlewares.js";
import { inventarioController } from "../controllers/inventario.js";
import { componenteController } from "../controllers/componente.js";
import { categoriaController } from "../controllers/categoria_componente.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
import { ComponenteValidator } from "../validators/componente_validator.js"
import { ProductoValidator } from "../validators/producto_validator.js"
import { EspecsValidator } from "../validators/especs_validator.js"

import { rolesUsuario } from "../controllers/usuario.js";
const componentesRouter = Router()


componentesRouter.get("/inventario", inventarioController.obtenerProductos)

componentesRouter.get("/inventario/:idproducto",
  UUIDParamValidator("idproducto"),
  checkValidator,
  inventarioController.obtenerProducto
)
componentesRouter.post("/inventario/:idcomponente",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  UUIDParamValidator("idcomponente"),
  ProductoValidator,
  checkValidator,
  inventarioController.crearProducto
)
componentesRouter.put("/inventario/:idproducto",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  UUIDParamValidator("idproducto"),
  ProductoValidator,
  checkValidator,
  inventarioController.actualizarProducto
)
componentesRouter.delete("/inventario/:idproducto",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  UUIDParamValidator("idproducto"),
  checkValidator,
  inventarioController.eliminarProducto
)

componentesRouter.get("/catalogo", componenteController.obtenerCatalogo)
componentesRouter.get("/catalogo/:idcomponente",
  UUIDParamValidator("idcomponente"),
  checkValidator,
  
  componenteController.obtener
)

componentesRouter.post("/catalogo",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  ComponenteValidator,
  EspecsValidator,
  checkValidator,
  checkNoExtraFields,
  categoriaController.validarEspecificaciones,
  componenteController.crear
)

componentesRouter.put("/catalogo/:idcomponente",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  UUIDParamValidator("idcomponente"),
  ComponenteValidator,
  EspecsValidator,
  checkValidator,
  checkNoExtraFields,
  categoriaController.validarEspecificacionesOpcionales,
  componenteController.actualizar
)

componentesRouter.delete("/catalogo/:idcomponente",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  UUIDParamValidator("idcomponente"),
  checkValidator,
  componenteController.eliminar
)

componentesRouter.get("/categorias", categoriaController.obtenerCategorias)
componentesRouter.get("/especificaciones-categoria/:idcategoria", categoriaController.obetenerEspecificiones)

componentesRouter.get("/especificaciones-componente/:idcomponente",
  UUIDParamValidator("idcomponente"),
  checkValidator,
  componenteController.obetenerEspecificiones
)




export default componentesRouter;