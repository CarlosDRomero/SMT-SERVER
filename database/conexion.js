import pg from "pg"
import { env } from "../environment.js"
const { Pool } = pg
export const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  // database: env.DB_NAME,
  password: env.DB_PASS,
  port: env.DB_PORT
})

try{
  
  console.log("Conectado a postgres, ",await pool.query("SELECT NOW()"))
}catch(e){
  console.log("Error al conectar con Postgres")
}

pool.on("error", () => {
  console.log("Error en la base datos, desconectando")
})
   

