import { poolClient } from "../database/conexion.js";

export const tiposNotificacion = Object.freeze({
  directa: 1,
  rol: 2
})

export const notificacionModel = {
  createDirectNotification: async (notificacionInfo) => {
    const query = {
      name: "crear-notificacion",
      text:
      `INSERT INTO notificacion 
      (idtipo, idevento, idusuario_iniciador, idusuario_notificado, idfuente, mensaje) 
      VALUES (1,$1, $2, $3, $4, $5) RETURNING *`,
      values: [
        notificacionInfo.idevento,
        notificacionInfo.idusuario_iniciador,
        notificacionInfo.idusuario_notificado,
        notificacionInfo.idfuente,
        notificacionInfo.mensaje
      ]
    }
    const result = await poolClient.query(query);
    return result.rows[0];
  },
  createRolNotification: async (notificacionInfo) => {
    const query = {
      name: "crear-notificacion",
      text:
      `INSERT INTO notificacion 
      (idtipo,idevento, idusuario_iniciador, rol_notificado, idfuente, mensaje) 
      VALUES (2,$1, $2, $3, $4, $5) RETURNING *`,
      values: [
        notificacionInfo.idevento,
        notificacionInfo.idusuario_iniciado,
        notificacionInfo.rol_notificado,
        notificacionInfo.idfuente,
        notificacionInfo.mensaje
      ]
    }
    const result = await poolClient.query(query);
    return result.rows[0];
  }
}