import { notificacionService } from "../services/notificaciones.js"

export const notificacionController = {
  notificar: async (req, res) => {
    const { notificacion, email, objetivo } = req.payload
    if (!notificacion) return;
    const notificaciondb = await notificacionService.crearNotificacion(notificacion)
    console.log(notificacion)
    if (objetivo)
      notificacionService.notificarSockets(objetivo, notificaciondb)
    if (email && notificaciondb)
      notificacionService.notificarACorreo(email,notificaciondb)
  }
}