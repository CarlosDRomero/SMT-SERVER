import { componenteModel } from "../models/componente.js";

export const componenteController = {
  obtenerCatalogo: async (req, res) => {
    const catalogo = await componenteModel.findAll();

    res.json(catalogo);
  },
  obetenerEspecificiones: async (req, res) => {
    const { idcomponente } = req.params
    const especificaciones = await componenteModel.findSpecsById(idcomponente);

    if (!especificaciones) return next({ name: "RecursoNoEncontrado", message: "No se encontro el componente" })
    res.json(especificaciones);
  },
  obtener: async (req,res,next) => {
    const { idcomponente } = req.params;
    const componente = await componenteModel.findById(idcomponente)
    const especificaciones = await componenteModel.findSpecsById(idcomponente)

    if (!componente) return next({ name: "RecursoNoEncontrado", message: "No se encontro este componente" })
    res.json({ ...componente, especificaciones })
  },
  crear: async (req, res) => {
    const nuevo = await componenteModel.create(req.body)
    const especificaciones = await componenteModel.createSpecs(nuevo.idcomponente,req.body.especificaciones)
    res.status(201).json({ ...nuevo, especificaciones })
  },
  actualizar: async (req,res) => {
    const idcomponente = req.params.idcomponente
    const actualizado = await componenteModel.update(idcomponente, req.body);
    if (!req.body.especificaciones) req.body.especificaciones = []

    for (const espec of req.body.especificaciones)
      await componenteModel.updateSpec(idcomponente, espec.idcat_espec, espec.valor);
    const especificaciones = await componenteModel.findSpecsById(idcomponente);
    res.status(201).json({ ...actualizado, especificaciones })
  },
  eliminar: async (req,res) => {
    const idcomponente = req.params.idcomponente
    const actualizado = componenteModel.delete(idcomponente);
    if (!actualizado) return next({ name: "RecursoNoEncontrado", message: "No se encontro un componente que eliminar" })
    res.status(204).json()
  }
}