import { poolClient } from "../database/conexion.js";

export const inventarioModel = {
  findAll: async () => {
    const query = {
      name: "obtener-componentes-inventario",
      text: "SELECT * FROM inventario i JOIN componente c ON i.idcomponente=c.idcomponente"
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  findById: async (idproducto) => {
    const query = {
      name: "obtener-componentes-inventario-id",
      text: "SELECT * FROM inventario i JOIN componente c ON i.idcomponente=c.idcomponente WHERE idproducto=$1",
      values: [idproducto]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  }
}