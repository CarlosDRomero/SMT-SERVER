import { Router } from "express"
import { checkValidator, extraerUsuario, verificarRol } from "../middlewares.js";
import { productoController } from "../controllers/producto.js";
import { categoriaController } from "../controllers/categoria_producto.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
import { ProductoValidator } from "../validators/producto_validator.js"

import { rolesUsuario } from "../controllers/usuario.js";
const productosRouter = Router()


productosRouter.get("/inventario", productoController.obtenerProductos)

productosRouter.get("/inventario/:idproducto",
  UUIDParamValidator("idproducto"),
  checkValidator,
  productoController.obtenerProducto
)
productosRouter.post("/inventario/:idproducto",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  UUIDParamValidator("idproducto"),
  ProductoValidator,
  checkValidator,
  productoController.crearProducto
)
productosRouter.put("/inventario/:idproducto",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  UUIDParamValidator("idproducto"),
  ProductoValidator,
  checkValidator,
  productoController.actualizarProducto
)
productosRouter.delete("/inventario/:idproducto",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  UUIDParamValidator("idproducto"),
  checkValidator,
  productoController.eliminarProducto
)


productosRouter.get("/categorias", categoriaController.obtenerCategorias)
productosRouter.get("/especificaciones-categoria/:idcategoria", categoriaController.obetenerEspecificiones)

productosRouter.get("/especificaciones-producto/:idproducto",
  UUIDParamValidator("idproducto"),
  checkValidator,
  productoController.obetenerEspecificiones
)




export default productosRouter;