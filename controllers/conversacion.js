import { conversacionModel } from "../models/conversacion.js"

export const conversacionController = {
  obtenerMensajesChat: async (req,res,next) => {
    const { idticket } = req.params
    const mensajes = await conversacionModel.findMessagesChat(idticket);
    return res.json(mensajes)
  }
}
