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
    const mensajes = await conversacionModel.findChat(idusuario, idticket);
    return res.json(mensajes)
  },
  obtenerConversaciones: async (req,res,next) => {
    const { idusuario } = req.usuario
    const mensajes = await conversacionModel.findChats(idusuario);
    return res.json(mensajes)
  }
}
