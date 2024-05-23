import { io } from "../socket/socket.js"
import { notificacionModel, tiposNotificacion } from "../models/notificacion.js"
import { mailerService } from "./mailer.js";

export const notificacionPayloadFactory = async ({ tipo, emailPayload, idevento, iniciador, objetivo, fuente, mensaje }) => {
  let payload = { objetivo };
  const idtipo = tiposNotificacion[tipo];
  if (!idtipo) throw new Error("Tipo de notificacion no valido");

  payload.notificacion = {
    tipo: idtipo,
    idevento,
    idusuario_iniciador: iniciador,
    idfuente: fuente,
    anexos: emailPayload?.anexos,
    mensaje
  }
  if (emailPayload) payload.email = { email: emailPayload.email, asunto: emailPayload.asunto }
  if (idtipo === 1) {
    payload.notificacion.idusuario_notificado = objetivo
  }
  if (idtipo === 2) {
    payload.notificacion.roles_notificados = objetivo
    if (payload.email){
      payload.email = []
      for (const rol of objetivo)
        payload.email = payload.email.concat(await notificacionModel.getUserEmailsByRole(rol));
    }
  }
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

  notificarACorreo: async (payload, notificacion,anexos) => {
    let html = `
    <h1>${payload.asunto}</h1>
    <p>${notificacion.mensaje}</p>
    `
    console.log("ANEXOS", anexos)
    if (anexos) html += anexos
    const emails = [].concat(payload.email)
    for (const email of emails)
      mailerService.enviarCorreo({
        to: email,
        subject: payload.asunto,
        html
      })
  }
}