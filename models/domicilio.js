import { poolClient } from "../database/conexion.js"

export const domicilioModel = {

  insertAddressUser: async( addressInfo ) => {
    const query = {
      name: "guardar-direccion",
      text: "INSERT INTO direccion (idusuario, c_dane_departamento, c_dane_municipio, barrio, cadena_direccion) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      values: [
        addressInfo.idusuario,
        addressInfo.c_dane_departamento,
        addressInfo.c_dane_municipio,
        addressInfo.barrio,
        addressInfo.cadena_direccion
      ]
    }
    const result = await poolClient.query(query);
    return result.rows[0]
  },

  getAddressUser: async (idusuario) => {
    const query = {
      name: "obtener-direccion-usuario",
      text: "SELECT * FROM direccion WHERE idusuario=$1",
      values: [idusuario]
    }
    const res = await poolClient.query(query);
    return res.rows;
  },

  updateAddressUser: async (idusuario, addressInfo, iddireccion) => {
    const query = {
      name: "actualizar-direccion",
      text: "UPDATE direccion SET c_dane_departamento = $2, c_dane_municipio = $3, barrio = $4, cadena_direccion = $5 WHERE iddireccion = $6 AND idusuario = $1 RETURNING *",
      values: [
        idusuario,
        addressInfo.c_dane_departamento,
        addressInfo.c_dane_municipio,
        addressInfo.barrio,
        addressInfo.cadena_direccion,
        iddireccion
      ]
    }
    const result = await poolClient.query(query);
    return result.rows[0]
  },

  deleteAddressUser: async (iddireccion, idusuario) => {
    const query = {
      name: "eliminar-direccion",
      text: "DELETE FROM direccion WHERE iddireccion = $1 AND idusuario = $2 RETURNING *",
      values: [iddireccion, idusuario]
    }
    const result = await poolClient.query(query);
    return result.rows[0];
  }
}