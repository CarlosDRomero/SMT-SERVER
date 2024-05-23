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
  validarCantidadProducto: async (req,res,next) => {
    const { idproducto } = req.params
    const producto = await inventarioModel.findById(idproducto);

    if (!producto) return next({ name: "RecursoNoEncontrado", message: "No se encontro este producto" })
    if (req.body.cantidad > producto.disponibilidad) return res.status(400).json({ error: "La cantidad no es valida" })
    req.payload = { ...req.paylaod, max: producto.disponibilidad }
    next()
  },
  crearProducto: async (req, res) => {
    const { idcomponente } = req.params
    const productoNuevo = await inventarioModel.crear({ idcomponente,...req.body });
    if (!productoNuevo) return res.status(400).json({ error: "Parece que no se pudo crear el producto, puede que el SKU este repetido" })
    const producto = await inventarioModel.findById(productoNuevo.idproducto);
    res.status(201).json(producto)
  },
  actualizarProducto: async (req, res) => {
    const { idproducto } = req.params
    const productoActualizado = await inventarioModel.actualizar(idproducto,req.body);
    if (!productoActualizado) return next({ name: "RecursoNoEncontrado", message: "No se encontro este producto" })
    const producto = await inventarioModel.findById(idproducto);
    res.status(201).json(producto)
  },
  eliminarProducto: async (req, res) => {
    const { idproducto } = req.params
    const productoEliminado = await inventarioModel.eliminar(idproducto);

    res.status(204).json(productoEliminado)
  }
}