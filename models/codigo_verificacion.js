import { pool } from "../database/conexion.js";

export const codigoModel = {
  findCodigoById: async (idcodigo) => {
    const query = {
      name: "obtener-codigo-id",
      text: "SELECT * FROM codigo_verificacion WHERE idcodigo=$1",
      values: [idcodigo]
    }
    
    const result = await pool.query(query)
    return result.rows[0]
  },
  
  findCodigoUsuario: async (idusuario) => {
    const query = {
      name: "obtener-codigo-usuario",
      text: "SELECT * FROM codigo_verificacion WHERE idusuario=$1",
      values: [idusuario]
    }
    
    const result = await pool.query(query)
    return result.rows[0]
  },
  
  limpiarCodigoUsuario: async (idUsuario) => {
    const query = {
      name: "limpiar-codigo",
      text: "DELETE FROM codigo_verificacion WHERE idUsuario=$1",
      values: [idUsuario]
    }
    
    const result = await pool.query(query);
    return result.rows[0]
  },
  
  crearCodigo: async (idusuario, codigo) => {
    const query = {
      name: "crear-codigo",
      text: "INSERT INTO codigo_verificacion (idUsuario, codigo) VALUES ($1, $2) RETURNING *",
      values: [idusuario, codigo]
    }
    const result = await pool.query(query);
    return result.rows[0]
  },
  
  actualizarCodigoUsuario: async (idusuario, codigo) => {
    const query = {
      name: "actualizar-codigo-usuario",
      text: "UPDATE codigo_verificacion SET codigo=$2 WHERE idusuario=$1 RETURNING *",
      values: [idusuario, codigo]
    }
    const result = await pool.query(query);
    return result.rows[0]
  },
  
  actualizarCodigoById: async (idcodigo, codigo) => {
    const query = {
      name: "actualizar-codigo-id",
      text: "UPDATE codigo_verificacion SET codigo=$2 WHERE idcodigo=$1 RETURNING *",
      values: [idcodigo, codigo]
    }
    const result = await pool.query(query);
    return result.rows[0]
  }
}