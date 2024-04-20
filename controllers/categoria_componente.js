import { categoriaModel } from "../models/categoria_componente.js";

export const categoriaController = {
  obtenerCategorias: async (req, res) => {
    const categorias = await categoriaModel.findAll();

    res.json(categorias);
  }
}