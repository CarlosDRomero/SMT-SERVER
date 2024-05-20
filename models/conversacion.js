import { poolClient } from "../database/conexion.js"

export const conversacionModel = {
  sendMessage: async (infoMensaje) => {
    const query = {
      name: "enviar-mensaje",
      // text: "enviar_mensaje(id_ticket UUID, id_emisor UUID, id_receptor UUID, cuerpo varchar(1000), fecha timestamp WITH time zone)"
      text: "SELECT * FROM enviar_mensaje($1,$2,$3,$4,$5)",
      values: [
        infoMensaje.idticket,
        infoMensaje.idemisor,
        infoMensaje.idreceptor,
        infoMensaje.contenido,
        infoMensaje.fecha_envio
      ]
    }
    const res = await poolClient.query(query);
    return res.rows[0]
  },
  updateMessageState: async (estado, idmensaje) => {
    const query = {
      name: "actualizar-estado-mensaje",
      text: "UPDATE mensaje SET estado=$1 WHERE idmensaje=$2",
      values:[estado, idmensaje]
    }
    const res = await poolClient.query(query);

    return res.rows[0];
  },
  findMessagesChat:async (idticket) => {
    const query = {
      name: "obtener-mensajes-conversacion",
      text: "SELECT m.* FROM conversacion c JOIN mensaje m ON m.idconversacion=c.idconversacion WHERE idticket=$1",
      values:[idticket]
    }
    const res = await poolClient.query(query);

    return res.rows;
  },
  findChat: async (idusuario, idticket) => {
    const query = {
      name: "obtener-conversacion",
      text: `
      SELECT * FROM obtener_conversaciones_usuario($1) WHERE idticket=$2 
      `,
      values:[idusuario, idticket]
    }
    const res = await poolClient.query(query);

    return res.rows[0];
  },
  findTicketChat: async (idticket) => {
    const query = {
      name: "obtener-ticket-chat",
      text: `
      SELECT * FROM ticket WHERE idticket=$1 
      `,
      values:[idticket]
    }
    const res = await poolClient.query(query);

    return res.rows[0];
  },
  findChats: async (idusuario) => {
    const query = {
      name: "obtenerid-conversaciones",
      text: `
      SELECT * FROM obtener_conversaciones_usuario($1) group by idconversacion, idticket, iddependiente
      `,
      values:[idusuario]
    }
    const res = await poolClient.query(query);

    return res.rows;
  },
  findChatExists: async (idticket) => {
    const query = {
      name: "obtener-conversacion-existente",
      text: `
      SELECT * FROM conversacion WHERE idticket=$1
      `,
      values:[idticket]
    }
    const res = await poolClient.query(query);

    return res.rows[0];
  }

}