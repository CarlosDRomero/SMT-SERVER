import { Router } from "express"
import { checkValidator } from "../middlewares.js";
import { inventarioController } from "../controllers/inventario.js";
import { componenteController } from "../controllers/componente.js";
import { categoriaController } from "../controllers/categoria_componente.js";
import { UUIDParamValidator } from "../validators/general_validators.js";

const componentesRouter = Router()


componentesRouter.get("/", inventarioController.obtenerProductos)
componentesRouter.get("/catalogo", componenteController.obtenerCatalogo)
componentesRouter.get("/categorias", categoriaController.obtenerCategorias)
componentesRouter.get("/catalogo/:id", UUIDParamValidator(),checkValidator, componenteController.obtenerComponente)
componentesRouter.get("/:id", UUIDParamValidator(),checkValidator, inventarioController.obtenerProducto)


export default componentesRouter;