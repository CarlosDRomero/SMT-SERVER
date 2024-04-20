import { poolClient } from "../database/conexion.js";


export const categoriaModel = {
  findAll: async () => {
    const query = {
      name: "obtener-categorias",
      text: "SELECT * FROM categoria_componente"
    }

    const res = await poolClient.query(query);
    return res.rows;
  }
}