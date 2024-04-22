import { Router } from "express"
import { checkNoExtraFields, checkValidator, extraerUsuario, verificarRol } from "../middlewares.js";
import { inventarioController } from "../controllers/inventario.js";
import { componenteController } from "../controllers/componente.js";
import { categoriaController } from "../controllers/categoria_componente.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
import { ComponenteValidator } from "../validators/componente_validator.js"
import { usuarioController } from "../controllers/usuario.js";

const componentesRouter = Router()


componentesRouter.get("/inventario", inventarioController.obtenerProductos)

componentesRouter.get("/inventario/:idproducto",
  UUIDParamValidator("idproducto"),
  checkValidator,
  inventarioController.obtenerProducto
)

componentesRouter.get("/catalogo/:idcomponente",
  UUIDParamValidator("idcomponente"),
  checkValidator,
  componenteController.obtener
)
componentesRouter.get("/catalogo", componenteController.obtenerCatalogo)

componentesRouter.post("/catalogo",
  extraerUsuario,
  verificarRol(usuarioController.roles.ADMIN),
  ComponenteValidator,
  checkValidator,
  checkNoExtraFields,
  componenteController.crear
)

componentesRouter.put("/catalogo/:idcomponente",
  extraerUsuario,
  verificarRol(usuarioController.roles.ADMIN),
  UUIDParamValidator("idcomponente"),
  ComponenteValidator,
  checkValidator,
  checkNoExtraFields,
  componenteController.actualizar
)

componentesRouter.delete("/catalogo/:idcomponente",
  extraerUsuario,
  verificarRol(usuarioController.roles.ADMIN),
  UUIDParamValidator("idcomponente"),
  checkValidator,
  componenteController.eliminar
)

componentesRouter.get("/categorias", categoriaController.obtenerCategorias)
componentesRouter.get("/especificaciones/:idcategoria", categoriaController.obetenerEspecificiones)




export default componentesRouter;