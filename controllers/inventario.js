import { inventarioModel } from "../models/inventario.js";


export const inventarioController = {
  obtenerProductos: async (req, res) => {
    const inventario = await inventarioModel.findAll();

    res.json(inventario);
  },
  obtenerProducto: async (req,res,next) => {
    const { idproducto } = req.params
    console.log("ID PRODUCTO: ", idproducto)
    const producto = await inventarioModel.findById(idproducto);
    if (!producto) return next({ name: "RecursoNoEncontrado", message: "No se encontro este producto" })
    res.json(producto);
  },
  crearProducto: async (req, res) => {
    const { idcomponente } = req.params
    const productoNuevo = await inventarioModel.crear({ idcomponente,...req.body });

    res.status(201).json(productoNuevo)
  },
  actualizarProducto: async (req, res) => {
    const { idproducto } = req.params
    const productoActualizado = await inventarioModel.actualizar(idproducto,req.body);

    res.status(201).json(productoActualizado)
  },
  eliminarProducto: async (req, res) => {
    const { idproducto } = req.params
    const productoEliminado = await inventarioModel.eliminar(idproducto);

    res.status(204).json(productoEliminado)
  }
}