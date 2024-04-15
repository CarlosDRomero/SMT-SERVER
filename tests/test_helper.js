import { pool } from "../database/conexion.js";

export const limpiarTablas = async () => {
  
  await pool.query("DELETE FROM usuario")
}

