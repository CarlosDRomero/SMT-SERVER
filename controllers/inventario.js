import { inventarioModel } from "../models/inventario.js";


export const inventarioController = {
  obtenerProductos: async (req, res) => {
    const inventario = await inventarioModel.findAll();

    res.json(inventario);
  },
  obtenerProducto: async (req,res,next) => {
    const { idproducto } = req.params
    const producto = await inventarioModel.findById(idproducto);
    if (!producto) return next()
    res.json(producto);
  }
}