import { pool } from "../database/conexion.js";
import { env } from "../environment.js";
import { getTimeZone } from "../services/time.js"

export const limpiarTablas = async () => {
  
  await pool.query("DELETE FROM usuario")
}

export const setTimeZone = async () => {
  await pool.query(`ALTER DATABASE ${env.DB_NAME} SET timezone='${getTimeZone()}';`);
}
