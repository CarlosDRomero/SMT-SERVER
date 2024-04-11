import { pool } from "../database/database.js";

const findCodigoById = async (idcodigo) => {
  const query = {
    name: "obtener-codigo-id",
    text: "SELECT * FROM codigos_verificacion WHERE idcodigo=$1",
    values: [idcodigo]
  }
  
  const result = await pool.query(query)
  return result.rows[0]
}

const findCodigoUsuario = async (idusuario) => {
  const query = {
    name: "obtener-codigo-usuario",
    text: "SELECT * FROM codigos_verificacion WHERE idusuario=$1",
    values: [idusuario]
  }
  
  const result = await pool.query(query)
  return result.rows[0]
}

const limpiarCodigoUsuario = async (idUsuario) => {
  const query = {
    name: "limpiar-codigo",
    text: "DELETE FROM codigos_verificacion WHERE idUsuario=$1",
    values: [idUsuario]
  }
  
  const result = await pool.query(query);
  return result.rows[0]
}

const crearCodigo = async (idusuario, codigo) => {
  const query = {
    name: "crear-codigo",
    text: "INSERT INTO codigos_verificacion (idUsuario, codigo) VALUES ($1, $2) RETURNING *",
    values: [idusuario, codigo]
  }
  const result = await pool.query(query);
  return result.rows[0]
}

const actualizarCodigoUsuario = async (idusuario, codigo) => {
  const query = {
    name: "actualizar-codigo-usuario",
    text: "UPDATE codigos_verificacion SET codigo=$2 WHERE idusuario=$1 RETURNING *",
    values: [idusuario, codigo]
  }
  const result = await pool.query(query);
  return result.rows[0]
}

const actualizarCodigoById = async (idcodigo, codigo) => {
  const query = {
    name: "actualizar-codigo-id",
    text: "UPDATE codigos_verificacion SET codigo=$2 WHERE idcodigo=$1 RETURNING *",
    values: [idcodigo, codigo]
  }
  const result = await pool.query(query);
  return result.rows[0]
}

export const codigoModel = {
  findCodigoById, findCodigoUsuario, limpiarCodigoUsuario, crearCodigo, actualizarCodigoById, actualizarCodigoUsuario
}