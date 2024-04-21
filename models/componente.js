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
  },
  create: async (componenteInfo) => {
    const query = {
      name: "crear-componente",
      text: "INSERT INTO componente (idcategoria, marca, nombre, descripcion, url_imagen) VALUES ($1, $2, $3, $4, $5)",
      values: [
        componenteInfo.idcategoria,
        componenteInfo.marca,
        componenteInfo.nombre,
        componenteInfo.descripcion,
        componenteInfo.url_imagen
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  update: async (idcomponente,componenteInfo) => {
    const query = {
      name: "actualizar-componente",
      text: "UPDATE componente SET idcategoria=$1, marca=$2, nombre=$3, descripcion=$4, url_imagen=$5 WHERE idcomponente=$6",
      values: [
        componenteInfo.idcategoria,
        componenteInfo.marca,
        componenteInfo.nombre,
        componenteInfo.descripcion,
        componenteInfo.url_imagen,
        idcomponente
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  }
}