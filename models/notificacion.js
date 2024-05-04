import { poolClient } from "../database/conexion.js";

export const tiposNotificacion = Object.freeze({
  directa: 1,
  rol: 2
})

export const notificacionModel = {
  createDirectNotification: async (notificacionInfo) => {
    const query = {
      name: "crear-notificacion-directa",
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
      name: "crear-notificacion-rol",
      text:
      `INSERT INTO notificacion 
      (idtipo,idevento, idusuario_iniciador, roles_notificados, idfuente, mensaje) 
      VALUES (2,$1, $2, $3, $4, $5) RETURNING *`,
      values: [
        notificacionInfo.idevento,
        notificacionInfo.idusuario_iniciado,
        notificacionInfo.roles_notificados,
        notificacionInfo.idfuente,
        notificacionInfo.mensaje
      ]
    }
    const result = await poolClient.query(query);
    return result.rows[0];
  },
  getUserEmailsByRole: async (rol) => {
    const query = {
      name: "obtener-emails-rol",
      text: "SELECT email FROM usuario WHERE rol=$1",
      values: [rol]
    }
    const result = await poolClient.query(query);
    return result.rows;
  },
  getUserNotifications: async (idusuario) => {
    const query = {
      name: "obtener-notificaciones-usuario",
      text: "SELECT * FROM obtener_notificaciones_usuario($1)",
      values: [idusuario]
    }
    const result = await poolClient.query(query);
    return result.rows;
  },
  getUserNotification: async (idusuario, idnotificacion) => {
    const query = {
      name: "obtener-notificacion-usuario",
      text: "SELECT * FROM obtener_notificaciones_usuario($1) WHERE idnotificacion=$2",
      values: [idusuario, idnotificacion]
    }
    const result = await poolClient.query(query);
    return result.rows[0];
  },
  addView: async (idusuario, idnotificacion) => {
    const query = {
      name: "marcar-notificacion-vista",
      text: "SELECT * FROM marcar_notificacion_vista($1, $2)",
      values: [idusuario, idnotificacion]
    }
    const result = await poolClient.query(query);
    return result.rows[0];
  }
}