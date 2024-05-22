import { env } from "./environment.js"
import { poolClient } from "./database/conexion.js"
import { Encrypt } from "./services/encryption.js"
export default setTimeout(async () => {
  console.log("EJECUTANDO DEFAULTS")
  if (env.NODE_ENV.trim() === "development" ){

    if (poolClient && (await poolClient.query("select * from usuario")).rows.length === 0){

      const query = `
      insert into usuario 
      (nombres, apellidos, clave, rol, email, nombre_usuario, fecha_nac, confirmado, fecha_confirmado) VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `
      let pass = await Encrypt.toHash("12345678")
      await poolClient.query(query, ["admin", "el admin", pass, "admin", "admin@support.max.ti", "admin", "1969-12-31", true, new Date()])
      await poolClient.query(query, ["empleado", "el empleado", pass, "empleado", "empleado@support.max.ti", "empleado", "1969-12-31", true, new Date()])
      await poolClient.query(query, ["cliente", "el cliente", pass, "cliente", "cliente@support.max.ti", "cliente", "1969-12-31", true, new Date()])
      console.log("Usuarios de desarrollo creados")
    }else{
      console.log("Ya hay usuarios de desarrollo:")
    }
    console.log(
      `
      admin@support.max.ti : 12345678
      empleado@support.max.ti : 12345678
      cliente@support.max.ti : 12345678`)
  }
}, 6000)
