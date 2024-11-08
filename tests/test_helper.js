import { poolClient } from "../database/conexion.js";

export const limpiarTablas = async (tablas) => {
  for (const tabla in tablas){
    await poolClient.query(`DELETE FROM ${tablas[tabla]}`)
  }

  
}

