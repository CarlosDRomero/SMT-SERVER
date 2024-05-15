import { carritoComprasModel } from "../models/carrito_compras.js";

export const carritoComprasController = {
  agregarACarrito: async (req,res) => {
    const { idusuario } = req.usuario;
    const { idproducto } = req.params
    const productoAntes = await carritoComprasModel.findProductInCart(idusuario, idproducto);
    if (productoAntes && productoAntes.cantidad + req.body.cantidad > req.payload.max) return res.status(400).json({ error: "No puedes agregar mas de este producto al carrito" })
    const productoCarrito = await carritoComprasModel.addToCart(idusuario, idproducto, req.body.cantidad);

    res.status(201).json(productoCarrito)
  },
  eliminarDeCarrito: async (req,res) => {
    const { idproducto } = req.params;
    const productoEliminado = await carritoComprasModel.removeFromCart(idproducto);
    
    res.status(201).json(productoEliminado)
  },
  obtenerProductosUsuario: async (req,res) => {
    const { idusuario } = req.usuario;
    const productos = await carritoComprasModel.getCartProductsByUser(idusuario);
    
    res.status(200).json(productos)
  },
  obtenerProductoUsuario: async (req,res) => {
    const { idusuario } = req.usuario;
    const { idproducto } = req.params
    const producto = await carritoComprasModel.getCartProductsByUser(idusuario, idproducto);
    
    res.json(producto)
  },
  obtenerInfoProductos: async (req,res) => {
    const { idusuario } = req.usuario;
    const producto = await carritoComprasModel.getProductsInfoByUser(idusuario);
    res.json(producto)
  },
}