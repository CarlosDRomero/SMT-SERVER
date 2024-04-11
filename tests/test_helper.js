import { pool } from "../database/database";

export const limpiarTablas = async () => {
  
  await pool.query("DELETE FROM usuario")
}

