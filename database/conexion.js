import pg from "pg"
import { env } from "../environment.js"

const { Pool } = pg

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASS,
  port: env.DB_PORT
})

export let poolClient = null;
let retryInterval = null;
const clearRetryInterval = () => {
  clearInterval(retryInterval)
  retryInterval = null;
}

const initializeRetryInterval = (ms = 7000) => {
  if (!retryInterval){
    console.log("Se reintentará la conexion...")
    retryInterval = setInterval(async () => {
      process.stdout.write("Reintentando conectarse a la base de datos: ")
      try {
        poolClient = await pool.connect()
      }catch{
        console.log("fallido");
      }
    }, ms);
  }
}


pool.on("connect", async (client) => {
  client.on("error", () => {
    console.log("Error al conectar con la base de datos")
    initializeRetryInterval();
  })
  clearRetryInterval();
  console.log("Conectado a postgres:\n",{ ...(await client.query("show timezone")).rows[0],...(await client.query("SELECT NOW()")).rows[0] })

})

pool.on("error", () => {
  console.log("Error con la base de datos")
})
try{
  poolClient = await pool.connect();
}catch{
  console.log("Error al conectar con la base datos")
  initializeRetryInterval();
}

