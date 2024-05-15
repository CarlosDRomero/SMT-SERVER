import { Router } from "express";
import { checkValidator, extraerUsuario, verificarRol } from "../middlewares.js";
import { rolesUsuario } from "../controllers/usuario.js";
import { carritoComprasController } from "../controllers/carrito_compras.js";
import { productoCarritoValidator } from "../validators/tienda_validator.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
import { inventarioController } from "../controllers/inventario.js";

const tiendaRouter = Router()

tiendaRouter.get("/validar-cantidad/:idproducto",
  productoCarritoValidator,
  UUIDParamValidator("idproducto"),
  checkValidator,
  inventarioController.validarCantidadProducto,
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

tiendaRouter.post("/carrito/:idproducto",
  extraerUsuario,
  verificarRol(rolesUsuario.CLIENTE),
  productoCarritoValidator,
  UUIDParamValidator("idproducto"),
  checkValidator,
  inventarioController.validarCantidadProducto,
  carritoComprasController.agregarACarrito
)

tiendaRouter.delete("/carrito/:idproducto",
  extraerUsuario,
  verificarRol(rolesUsuario.CLIENTE),
  UUIDParamValidator("idproducto"),
  checkValidator,
  carritoComprasController.eliminarDeCarrito
)

export default tiendaRouter;