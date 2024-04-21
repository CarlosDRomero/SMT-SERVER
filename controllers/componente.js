import { componenteModel } from "../models/componente.js";

export const componenteController = {
  obtenerCatalogo: async (req, res) => {
    const catalogo = await componenteModel.findAll();

    res.json(catalogo);
  },
  obtener: async (req,res,next) => {
    const id = req.params.id;
    const componente = await componenteModel.findById(id)
    if (!componente) return next()
    res.json(componente)
  },
  crear: async (req, res) => {
    const nuevo = componenteModel.create(req.body)
    res.status(201).json(nuevo)
  },
  actualizar: async (req,res) => {
    const idcomponente = req.params.idcomponente
    const actualizado = componenteModel.update(idcomponente, req.body);
    res.status(201).json(actualizado)
  }
}