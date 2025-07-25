import { ordenCompraModel } from "../models/orden_compra.js"
import { productoModel } from "../models/producto.js"
import { carritoComprasModel } from "../models/carrito_compras.js"
import { promocionesModel } from "../models/promocion.js"
import { crearNotificacionAsignacionCupon } from "../services/notificaciones.js"

export const ordenCompraController = {
  generarOrdenCompra: async(req, res, next) => {
    const { idusuario } = req.usuario
    const orden = await ordenCompraModel.addOrder(req.body, idusuario)
    ordenCompraModel.addProductstoOrder(req.body.productos, orden.idorden)
    for (const producto of req.body.productos){
      await carritoComprasModel.removeFromCart(producto.idproducto)
    }
    res.json(orden)

    next()
  },
  calcularCostoOrden: async(req, res, next) => {
    const cupon = await promocionesModel.checkCouponByUserId(req.body.idcupon, req.usuario.idusuario)
    req.body.productos = await Promise.all(req.body.productos.map(async p => {
      const { precio_final } = await productoModel.findById(p.idproducto)
      return { ...p, costo: precio_final }
    }))
    req.body.costo_total = req.body.productos.reduce((acumulador, productoActual) => acumulador + productoActual.costo * productoActual.cantidad, 0)
    if (cupon) {
      await promocionesModel.markAsUsed(cupon.idcupon, req.usuario.idusuario)
    }
    req.body.costo_final = cupon ? cupon.porcentaje ? Math.round(req.body.costo_total * (1 - (cupon.porcentaje / 100))) : req.body.costo_total - cupon.cantidad : req.body.costo_total
    req.body.costo_final = Math.round(req.body.costo_final * 1.19)
    
    // console.log("cupon", req.body.costo_total, req.body.costo_final, req.body.costo_total * (1 - (cupon?.porcentaje / 100)))
    next()
  },
  validarCuponesGanados: async (req, res, next) => {
    const { idusuario } = req.usuario
    const cuponesPendientes = await ordenCompraModel.getPendingCoupons(idusuario)
    if (cuponesPendientes.length === 0) return

    
    await promocionesModel.assignCouponsToUser(cuponesPendientes, idusuario)

    req.payload = await Promise.all(
      cuponesPendientes.map(async c =>
        await crearNotificacionAsignacionCupon(idusuario, c)
      )
    )
    console.log(req.payload)
    next()
  },
  obtenerOrdenesUsuario: async(req, res) => {
    //obtener usuario,ordenes del usuario, por cada orden obtener productos y agregarle los productos a un array
    const { idusuario } = req.usuario
    const ordenes = await ordenCompraModel.getOrdersByUser(idusuario)
    for(const o of ordenes) {
      const productosOrden = await ordenCompraModel.getProductsOrder(o.idorden)
      o.productos = productosOrden
    }
    res.json(ordenes)
  },
}