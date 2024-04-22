import { categoriaModel } from "../models/categoria_componente.js";

export const categoriaController = {
  obtenerCategorias: async (req, res) => {
    const categorias = await categoriaModel.findAll();

    res.json(categorias);
  },
  obetenerEspecificiones: async (req, res) => {
    const { idcategoria } = req.params;

    const especificaciones = await categoriaModel.findSpecsById(idcategoria);
    res.json(especificaciones)
  }
}