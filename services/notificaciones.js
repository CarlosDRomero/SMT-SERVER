import { io } from "../socket/socket.js"
import { notificacionModel, tiposNotificacion } from "../models/notificacion.js"
import { mailerService } from "./mailer.js";

export const notificacionPayloadFactory = ({ tipo, emailPayload: { email, asunto }, idevento, iniciador, objetivo, fuente, mensaje }) => {
  let payload = { objetivo };
  const idtipo = tiposNotificacion[tipo];
  if (!idtipo) throw new Error("Tipo de notificacion no valido");
  

  payload.notificacion = {
    tipo: idtipo,
    idevento,
    idusuario_iniciador: iniciador,
    idfuente: fuente,
    mensaje
  }

  if (idtipo === 1) payload.notificacion.idusuario_notificado = objetivo
  if (idtipo === 2) payload.notificacion.rol_notificado = objetivo

  if (email && asunto) payload.email = { email, asunto }
  
  return payload;
}

export const notificacionService = {
  crearNotificacion: async (payload) => {
    if (payload.tipo === 1) return await notificacionService.crearNotificacionUsuario(payload);
    if (payload.tipo === 2) return await notificacionService.crearNotificacionRol(payload);
    return null;
  },
  crearNotificacionUsuario: async (notificacionInfo) => {
    return await notificacionModel.createDirectNotification(notificacionInfo);
  },

  crearNotificacionRol: async (notificacionInfo) => {
    return await notificacionModel.createRolNotification(notificacionInfo);
  },

  notificarSockets: async (target, notificacion) => {
    io.in( target ).emit("notificacion", notificacion)
  },

  notificarACorreo: async (payload, notificacion) => {
    const html = `
    <h1>${payload.asunto}</h1>
    <p>${notificacion.mensaje}</p>
    `
    mailerService.enviarCorreo({
      to: payload.email,
      subject: payload.asunto,
      html
    })
  }
}