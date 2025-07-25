import { notificacionModel } from "../models/notificacion.js";
import { notificacionService } from "../services/notificaciones.js"

export const notificacionController = {
  notificar: async (req, _, next) => {
    if (req.payload){

      req.payload.forEach(async payload => {
        const { notificacion, email, objetivo } = payload
        if (!notificacion) return;
        console.log(notificacion)
        const notificaciondb = await notificacionService.crearNotificacion(notificacion)
        console.log(notificaciondb)
        notificacionService.notificarSockets(objetivo, notificaciondb)
        if (email && notificaciondb){
          notificacionService.notificarACorreo(email,notificaciondb,notificacion.anexos )
        }
      });
    }
    next()
  },
  obtenerNotificacionesUsuario: async (req, res) => {
    const { idusuario } = req.usuario
    const notificaciones = await notificacionModel.getUserNotifications(idusuario);
    res.json(notificaciones)
  },
  actualizarVista: async (req, res) => {
    const { idusuario } = req.usuario
    const { idnotificacion } = req.params
    const notificacion = await notificacionModel.addView(idusuario, idnotificacion);
    console.log(notificacion)

    res.json(notificacion)
  }
}