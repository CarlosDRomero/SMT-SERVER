import { poolClient } from "../database/conexion.js";
import { env } from "../environment.js";
import { getTimeZone } from "../services/time.js"

export const limpiarTablas = async () => {
  
  await poolClient.query("DELETE FROM usuario")
}

export const setTimeZone = async () => {
  await poolClient.query(`ALTER DATABASE ${env.DB_NAME} SET timezone='${getTimeZone()}';`);
}
