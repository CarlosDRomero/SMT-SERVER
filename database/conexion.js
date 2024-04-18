import pg from "pg"
import { env } from "../environment.js"
import { getTimeZone } from "../services/time.js"
const { Pool } = pg

export const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  // database: env.DB_NAME,
  password: env.DB_PASS,
  port: env.DB_PORT
})

pool.on("error", () => {
  console.log("Error en la base datos, desconectando")
})

try{
  await pool.query(`ALTER DATABASE ${env.DB_NAME} SET timezone='${getTimeZone()}';`);
  console.log("Conectado a postgres, ",(await pool.query("SELECT NOW()")).rows[0])
}catch(e){
  console.log("Error al conectar con Postgres")
}

   