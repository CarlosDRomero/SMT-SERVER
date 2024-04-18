import pg from "pg"
import { env } from "../environment.js"
import { getTimeZone } from "../services/time.js"
const { Pool,Connection } = pg

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASS,
  port: env.DB_PORT
})

export let poolClient;
let retryInterval = null;

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
const clearRetryInterval = () => {
  clearInterval(retryInterval)
  retryInterval = null;
}


pool.on("connect", async (client) => {
  client.on("error", (error) => {
    console.log("Error al conectar con la base de datos")
    initializeRetryInterval();
  })
  clearRetryInterval();
  const query = {
    name: "sync-timezone",
    text: `SET timezone TO '${getTimeZone()}'`,
  }
  await client.query(query);
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

