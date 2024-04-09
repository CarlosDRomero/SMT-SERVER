import { pool } from "../database/database.js"

const registrar = async ( user ) => {
  const query = {
    name: "registrar-cliente",
    text: "INSERT INTO usuario (nombres, apellidos, clave, nombre_usuario, email, fecha_nac) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    values: user
  }
  
  return await pool.query(query)
}


export const usuarioModel = {
  registrar
}