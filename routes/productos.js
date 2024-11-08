import { Router } from "express"
import { checkValidator, extraerUsuario,verificarRol, withPagination } from "../middlewares.js";
import { productoController } from "../controllers/producto.js";
import { categoriaController } from "../controllers/categoria_producto.js";
import { NumberParamValidator, UUIDParamValidator } from "../validators/general_validators.js";
import { ProductoValidator } from "../validators/producto_validator.js"

import { rolesUsuario } from "../controllers/usuario.js";
import { promocionesController } from "../controllers/promocion.js";
import { CuponValidator, OfertaValidator } from "../validators/promociones_validator.js";
const productosRouter = Router()


productosRouter.get("/inventario",
  withPagination(
    productoController.orderValidFields,
    productoController.pageCursorSchema,
    productoController.obtenerProductos
  )
)

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
productosRouter.get("/categorias/:idcategoria", NumberParamValidator("idcategoria"), categoriaController.obtenerCategoria)
productosRouter.get("/especificaciones-categoria/:idcategoria", categoriaController.obetenerEspecificiones)

productosRouter.get("/especificaciones-producto/:idproducto",
  UUIDParamValidator("idproducto"),
  checkValidator,
  productoController.obetenerEspecificiones
)

productosRouter.get("/ofertas",
  withPagination(
    [], promocionesController.ofertaPageCursorSchema, promocionesController.obtenerOfertasPaginadas
  )
)

productosRouter.post("/ofertas",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  OfertaValidator,
  checkValidator,
  promocionesController.verificarOfertaSobrepuesta,
  promocionesController.crearOferta
)
productosRouter.put("/ofertas/:idoferta",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  OfertaValidator,
  UUIDParamValidator("idoferta"),
  checkValidator,
  promocionesController.verificarOfertaSobrepuesta,
  promocionesController.actualizarOferta
)

productosRouter.get("/cupones/administrar",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  promocionesController.obtenerCupones
)
productosRouter.get("/cupones",
  extraerUsuario,
  verificarRol(rolesUsuario.CLIENTE),
  promocionesController.obtenerCuponesUsuario
)

productosRouter.post("/cupones",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  CuponValidator,
  checkValidator,
  promocionesController.verificarInfoCupon,
  promocionesController.crearCupon
)
productosRouter.put("/cupones/:idcupon",
  extraerUsuario,
  verificarRol(rolesUsuario.ADMIN),
  OfertaValidator,
  UUIDParamValidator("idcupon"),
  checkValidator,
  promocionesController.verificarInfoCupon,
  promocionesController.actualizarCupon
)


export default productosRouter;