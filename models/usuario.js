import { pool } from "../database/database.js"
import { genCode } from "../utils/random.js"
import { codigoModel } from "./codigo_verificacion.js";

const limpiarUsuario = async (idUsuario) => {
  const query = {
    name: "limpiar-usuario",
    text: "DELETE FROM usuario WHERE idUsuario=$1",
    values: [idUsuario]
  }
  
  const result = await pool.query(query);
  return result.rows[0]
}

const findUsuario = async (userInfo) => {
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
const confirmar = async (idUsuario) => {
  const query = {
    name: "confirmar-usuario",
    text: "UPDATE usuario SET confirmado=true WHERE idusuario=$1 RETURNING *",
    values: [idUsuario]
  }

  const result = await pool.query(query);
  return result.rows[0]
}
export const usuarioModel = {
  registrar, findUsuario,limpiarUsuario, confirmar
}