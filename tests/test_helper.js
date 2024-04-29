import { poolClient } from "../database/conexion.js";

export const limpiarTablas = async () => {
  
  await poolClient.query("DELETE FROM usuario")
}

