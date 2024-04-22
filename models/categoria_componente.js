import { poolClient } from "../database/conexion.js";


export const categoriaModel = {
  findAll: async () => {
    const query = {
      name: "obtener-categorias",
      text: "SELECT * FROM categoria_componente"
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  findSpecsById: async (idcategoria) => {
    const query = {
      name: "obtener-especificaciones-categoria",
      text: "SELECT idcat_espec, atributo FROM categoria_espec ce JOIN atributo_espec ae ON ae.idespec=ce.idespec WHERE ce.idcategoria=$1",
      values: [idcategoria]
    }

    const res = await poolClient.query(query);
    return res.rows;
  }
}