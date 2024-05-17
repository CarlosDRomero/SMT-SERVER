import { conversacionModel } from "../models/conversacion.js"

export const conversacionController = {
  obtenerMensajesChat: async (req,res,next) => {
    const { idticket } = req.params
    const mensajes = await conversacionModel.findMessagesChat(idticket);
    
    return res.json(mensajes)
  },
  obtenerConversacion: async (req,res,next) => {
    const { idusuario } = req.usuario
    const { idticket } = req.params
    const conversacion = await conversacionModel.findChat(idusuario, idticket);
    if (!conversacion) return res.status(403).json({ mensaje:"Acceso no permitido" })
    return res.json({ ...conversacion, ...(await conversacionModel.findTicketChat(conversacion.idticket)) })
  },
  obtenerConversaciones: async (req,res,next) => {
    const { idusuario } = req.usuario
    let conversaciones = await conversacionModel.findChats(idusuario);
    if (!conversaciones) return res.status(403).json({ mensaje:"Acceso no permitido" })
    conversaciones = await Promise.all(conversaciones.map(async c => ({ ...c, ...(await conversacionModel.findTicketChat(c.idticket)) })))
    return res.json(conversaciones)
  }
}
