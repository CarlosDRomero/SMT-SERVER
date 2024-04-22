import { componenteModel } from "../models/componente.js";

export const componenteController = {
  obtenerCatalogo: async (req, res) => {
    const catalogo = await componenteModel.findAll();

    res.json(catalogo);
  },
  obtener: async (req,res,next) => {
    const { idcomponente } = req.params;
    const componente = await componenteModel.findById(idcomponente)
    const especificaciones = await componenteModel.findSpecsById(idcomponente)
    console.log("componente::::",componente)
    if (!componente) return next()
    res.json({ ...componente, especificaciones })
  },
  crear: async (req, res) => {
    const nuevo = await componenteModel.create(req.body)
    const especificaciones = await componenteModel.createSpecs(nuevo.idcomponente,req.body.especificaciones)
    res.status(201).json({ ...nuevo, especificaciones })
  },
  actualizar: async (req,res) => {
    const idcomponente = req.params.idcomponente
    const actualizado = componenteModel.update(idcomponente, req.body);
    res.status(201).json(actualizado)
  },
  eliminar: async (req,res) => {
    const idcomponente = req.params.idcomponente
    const actualizado = componenteModel.delete(idcomponente);
    if (!actualizado) return res.status(404).json({ error: "No se encontro el elemento que eliminar" })
    res.status(204).json()
  }
}