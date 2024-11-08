import { poolClient } from "../database/conexion.js";


export const categoriaModel = {
  findAll: async () => {
    const query = {
      name: "obtener-categorias",
      text: "SELECT * FROM categoria_producto"
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  findById: async (idcategoria) => {
    const query = {
      name: "obtener-categoria",
      text: "SELECT * FROM categoria_producto WHERE idcategoria = $1",
      values: [idcategoria]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  findSpecsById: async (idcategoria) => {
    const query = {
      name: "obtener-especificaciones-categoria",
      text: `SELECT pe.idespec, ae.atributo FROM producto_espec pe 
      JOIN atributo_espec ae ON ae.idespec=pe.idespec
      JOIN producto p ON p.idproducto=pe.idproducto
      JOIN categoria ce on ce.idcategoria=p.idcategoria
      WHERE ce.idcategoria=$1`,
      values: [idcategoria]
    }

    const res = await poolClient.query(query);
    return res.rows;
  }
}