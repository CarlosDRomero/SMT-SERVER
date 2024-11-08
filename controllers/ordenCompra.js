import { ordenCompraModel } from "../models/orden_compra.js"
import { productoModel } from "../models/producto.js"
import { carritoComprasModel } from "../models/carrito_compras.js"

export const ordenCompraController = {
  generarOrdenCompra: async(req, res, next) => {
    const { idusuario } = req.usuario
    const orden = await ordenCompraModel.addOrder(req.body, idusuario)
    ordenCompraModel.addProductstoOrder(req.body.productos, orden.idorden)
    for (const producto of req.body.productos){
      await carritoComprasModel.removeFromCart(producto.idproducto)
    }
    res.json(orden)
  },
  calcularCostoOrden: async(req, res, next) => {
    const cupon = undefined
    req.body.productos = await Promise.all(req.body.productos.map(async p => {
      const { precio } = await productoModel.findById(p.idproducto)
      return { ...p, costo: precio }
    }))
    console.log(req.body.productos)
    req.body.costo_total = req.body.productos.reduce((acumulador, productoActual) => acumulador + productoActual.costo * productoActual.cantidad, 0)

    req.body.costo_final = cupon ? cupon.descuento ? req.body.costo_total * (1 - cupon.descuento) : req.body.costo_total - cupon.cantidad : req.body.costo_total

    next()
  },
  obtenerOrdenesUsuario: async(req, res, next) => {
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