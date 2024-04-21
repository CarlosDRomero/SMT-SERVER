import { Router } from "express"
import { checkValidator, extraerUsuario, verificarRol } from "../middlewares.js";
import { inventarioController } from "../controllers/inventario.js";
import { componenteController } from "../controllers/componente.js";
import { categoriaController } from "../controllers/categoria_componente.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
import { usuarioModel } from "../models/usuario.js";
import { usuarioController } from "../controllers/usuario.js";

const componentesRouter = Router()


componentesRouter.get("/", inventarioController.obtenerProductos)
componentesRouter.get("/catalogo", componenteController.obtenerCatalogo)

componentesRouter.get("/catalogo/:id", UUIDParamValidator(),checkValidator, componenteController.obtener)
componentesRouter.post("/catalogo", extraerUsuario, verificarRol(usuarioController.roles.ADMIN),checkValidator, componenteController.crear)
componentesRouter.put("/catalogo/:idcomponente", extraerUsuario, verificarRol(usuarioController.roles.ADMIN), UUIDParamValidator("idcomponente"),checkValidator, componenteController.actualizar)

componentesRouter.get("/categorias", categoriaController.obtenerCategorias)
componentesRouter.get("/:idproducto", UUIDParamValidator("idproducto"),checkValidator, inventarioController.obtenerProducto)



export default componentesRouter;