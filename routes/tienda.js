import { Router } from "express";
import { checkValidator, extraerUsuario, verificarRol } from "../middlewares.js";
import { rolesUsuario } from "../controllers/usuario.js";
import { carritoComprasController } from "../controllers/carrito_compras.js";
import { productoCarritoValidator } from "../validators/tienda_validator.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
import { productoController } from "../controllers/producto.js";
import { validatorOrdenCompra } from "../validators/validatorOrdenCompra.js";
import { ordenCompraController } from "../controllers/ordenCompra.js";
import { notificacionController } from "../controllers/notificacion.js";

const tiendaRouter = Router()

tiendaRouter.get("/validar-cantidad/:idproducto",
  productoCarritoValidator,
  UUIDParamValidator("idproducto"),
  checkValidator,
  productoController.validarCantidadProducto,
  (req,res) => {
    res.status(204).send();
  }
)

tiendaRouter.get("/carrito/info-productos",
  extraerUsuario,
  verificarRol(rolesUsuario.CLIENTE),
  carritoComprasController.obtenerInfoProductos,
)
tiendaRouter.get("/carrito",
  extraerUsuario,
  verificarRol(rolesUsuario.CLIENTE),
  carritoComprasController.obtenerProductosUsuario,
)
tiendaRouter.get("/carrito/:idproducto",
  extraerUsuario,
  verificarRol(rolesUsuario.CLIENTE),
  UUIDParamValidator("idproducto"),
  checkValidator,
  carritoComprasController.obtenerProductoUsuario,
)

tiendaRouter.get("/orden-de-compra",
  extraerUsuario,
  verificarRol(rolesUsuario.CLIENTE),
  ordenCompraController.obtenerOrdenesUsuario,
)

tiendaRouter.post("/carrito/:idproducto",
  extraerUsuario,
  verificarRol(rolesUsuario.CLIENTE),
  productoCarritoValidator,
  UUIDParamValidator("idproducto"),
  checkValidator,
  productoController.validarCantidadProducto,
  carritoComprasController.agregarACarrito
)

tiendaRouter.post("/orden-de-compra",
  extraerUsuario,
  verificarRol(rolesUsuario.CLIENTE),
  validatorOrdenCompra,
  checkValidator,
  ordenCompraController.calcularCostoOrden,
  ordenCompraController.generarOrdenCompra,
  ordenCompraController.validarCuponesGanados,
  notificacionController.notificar
)


tiendaRouter.delete("/carrito/:idproducto",
  extraerUsuario,
  verificarRol(rolesUsuario.CLIENTE),
  UUIDParamValidator("idproducto"),
  checkValidator,
  carritoComprasController.eliminarDeCarrito
)

export default tiendaRouter;