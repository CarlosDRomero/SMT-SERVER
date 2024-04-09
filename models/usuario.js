import { pool } from "../database/database.js"
import { genCode } from "../utils/random.js"

const limpiarCodigo = async (idUsuario) => {
  const query = {
    name: "limpiar-codigo",
    text: "DELETE FROM codigos_verificacion WHERE idUsuario=$1",
    values: [idUsuario]
  }
  
  const result = await pool.query(query);
  return result.rows[0]
}
const limpiarUsuario = async (idUsuario) => {
  await limpiarCodigo(idUsuario);
  const query = {
    name: "limpiar-usuario",
    text: "DELETE FROM usuario WHERE idUsuario=$1",
    values: [idUsuario]
  }
  
  const result = await pool.query(query);
  return result.rows[0]
}

const getUsuario = async (userInfo) => {
  const query = {
    name: "obtener-usuario",
    text: "SELECT * FROM usuario WHERE nombre_usuario=$1 OR email=$2",
    values: [userInfo.nombreUsuario, userInfo.email]
  }
  
  const result = await pool.query(query);
  return result.rows[0]
}


const registrar = async ( userInfo ) => {
  const query = {
    name: "registrar-cliente",
    text: "INSERT INTO usuario (nombres, apellidos, clave, nombre_usuario, email, fecha_nac) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    values: [
      userInfo.nombres,
      userInfo.apellidos,
      userInfo.clave,
      userInfo.nombreUsuario,
      userInfo.email,
      userInfo.fecha_nac
    ]
  }
  
  const result = await pool.query(query);
  return result.rows[0]
}

const nuevoCodigo = async (user) => {
  const query = {
    name: "crear-codigo",
    text: "INSERT INTO codigos_verificacion (idUsuario, codigo) VALUES ($1, $2) RETURNING *",
    values: [user.idusuario, genCode()]
  }
  const result = await pool.query(query);
  return result.rows[0]
}

const actualizarCodigo = async (payload) => {
  const query = {
    name: "actualizar-codigo",
    text: "UPDATE codigos_verificacion SET codigo=$2 WHERE idUsuario=$1 RETURNING *",
    values: [payload.idUsuario, genCode()]
  }
  const result = await pool.query(query);
  return result.rows[0]
}

export const usuarioModel = {
  registrar, nuevoCodigo, actualizarCodigo, getUsuario,limpiarUsuario
}