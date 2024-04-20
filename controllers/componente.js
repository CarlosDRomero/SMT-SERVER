import { componenteModel } from "../models/componente.js";

export const componenteController = {
  obtenerCatalogo: async (req, res) => {
    const catalogo = await componenteModel.findAll();

    res.json(catalogo);
  },
  obtenerComponente: async (req,res,next) => {
    const id = req.params.id;
    const componente = await componenteModel.findById(id)
    if (!componente) return next()
    res.json(!componente)
  }
}