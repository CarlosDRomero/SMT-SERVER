import { productoModel } from "../models/producto.js";
import { encodeCursor, setCursorLast } from "../utils.js";


export const productoController = {
  orderValidFields: ["precio", "disponibilidad"],
  pageCursorSchema: {
    tiebreaker: { name: "fecha_salida", direction: -1 },
    id: { name: "idproducto" }
  },
  obtenerProductos: async (req, res) => {
    const catalogo = await productoModel.pageProducts(req.pageCursor, productoController.pageCursorSchema);
    
    if (catalogo.length){
      setCursorLast(catalogo[catalogo.length - 1], req.pageCursor, productoController.pageCursorSchema)
    }
    
    const nextPageCursor = encodeCursor(req.pageCursor)
    res.json({ nextPageCursor, data: catalogo });
  },
  obetenerEspecificiones: async (req, res) => {
    const { idproducto } = req.params
    const especificaciones = await productoModel.findSpecsById(idproducto);

    if (!especificaciones) return next({ name: "RecursoNoEncontrado", message: "No se encontro el producto" })
    res.json(especificaciones);
  },
  validarCantidadProducto: async (req,res,next) => {
    const { idproducto } = req.params
    const producto = await productoModel.findById(idproducto);

    if (!producto) return next({ name: "RecursoNoEncontrado", message: "No se encontro este producto" })
    if (req.body.cantidad > producto.disponibilidad) return res.status(400).json({ error: "La cantidad no es valida" })
    req.payload = { ...req.paylaod, max: producto.disponibilidad }
    next()
  },
  obtenerProducto: async (req,res,next) => {
    const { idproducto } = req.params;
    const producto = await productoModel.findById(idproducto)
    const especificaciones = await productoModel.findSpecsById(idproducto)

    if (!producto) return next({ name: "RecursoNoEncontrado", message: "No se encontro este producto" })
    res.json({ ...producto, especificaciones })
  },
  crearProducto: async (req, res) => {
    const nuevo = await productoModel.create(req.body)
    const especificaciones = await productoModel.createSpecs(nuevo.idproducto,req.body.especificaciones)
    res.status(201).json({ ...nuevo, especificaciones })
  },
  actualizarProducto: async (req,res) => {
    const idproducto = req.params.idproducto
    const actualizado = await productoModel.update(idproducto, req.body);
    if (!req.body.especificaciones) req.body.especificaciones = []

    for (const espec of req.body.especificaciones)
      await productoModel.updateSpec(idproducto, espec.idespec, espec.valor);
    const especificaciones = await productoModel.findSpecsById(idproducto);
    res.status(201).json({ ...actualizado, especificaciones })
  },
  eliminarProducto: async (req,res) => {
    const idproducto = req.params.idproducto
    const actualizado = productoModel.delete(idproducto);
    if (!actualizado) return next({ name: "RecursoNoEncontrado", message: "No se encontro un producto que eliminar" })
    res.status(204).json()
  }
}