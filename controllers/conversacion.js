import { conversacionModel } from "../models/conversacion.js"
import { popularTicket } from "./ticket.js";
import { rolesUsuario } from "./usuario.js";

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
    const ticket = await conversacionModel.findTicketChat(conversacion.idticket)
    await popularTicket(ticket, req.usuario,["empleado","usuario"])
    return res.json({ ...conversacion, ticket })
  },
  obtenerConversaciones: async (req,res,next) => {
    const { rol,idusuario } = req.usuario
    let conversaciones = await conversacionModel.findChats(idusuario);
    if (!conversaciones) return res.status(403).json({ mensaje:"Acceso no permitido" })
      
    conversaciones = await Promise.all(conversaciones.map(async c => {
      const ticket = await conversacionModel.findTicketChat(c.idticket)
      if (rol === rolesUsuario.CLIENTE)
        await popularTicket(ticket, req.usuario,["empleado"])
      if (rol === rolesUsuario.EMPLEADO)
        await popularTicket(ticket, req.usuario,["usuario"])

      return { ...c, ticket }
    }))
    return res.json(conversaciones)
  }
}
