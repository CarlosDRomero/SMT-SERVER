import { pool } from "../database/database.js"

const registrar = async ( user ) => {
  const query = {
    name: "registrar-cliente",
    text: "INSERT INTO usuario (nombres, apellidos, clave, nombreUsuario, email, fecha_nac) VALUES ($1, $2, $3, $4, $5, $6)",
    values: user
  }
  
  return await pool.query(query)
}


export const usuarioModel = {
  registrar
}