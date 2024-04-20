import { poolClient } from "../database/conexion.js";

export const componenteModel = {
  findAll: async () => {
    const query = {
      name: "obtener-componentes",
      text: "SELECT * FROM componente"
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  findById: async (idcomponente) => {
    const query = {
      name: "obtener-componente-id",
      text: "SELECT * FROM componente WHERE idcomponente=$1",
      values: [idcomponente]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  }
}