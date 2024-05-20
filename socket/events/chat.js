import joi from "joi"
import { ticketModel } from "../../models/ticket.js"
import { conversacionModel } from "../../models/conversacion.js";

const schema = joi.object({
  idticket: joi.string().uuid(),
  contenido: joi.string().not().empty(),
  fecha_envio: joi.date()
})

const chatEvents = {
  onEvents:{
    "enviar-mensaje": (socket, evento) => async (mensaje, cb) => {
      const { usuario } = socket.handshake;
      const { error, value } = schema.validate(mensaje)
      if (error) return console.log(error)
      try{
        const ticket = await ticketModel.findById(value.idticket);
        if (!ticket || !ticket.idusuario || !ticket.empleado_asignado) return
        // if (usuario.idusuario!==ticket.idcliente && usuario)
        const idemisor = usuario.idusuario;
        const idreceptor = idemisor === ticket.idusuario ? ticket.empleado_asignado : ticket.idusuario;
        const primeravez = await conversacionModel.findChatExists(ticket.idticket)
        console.log("primera",primeravez)
        if (!primeravez){
          socket.emit("nuevo-chat")
          socket.to(idreceptor).emit("nuevo-chat")
        }
        console.log("mensaje:",value)
        const mensajeCreado = await conversacionModel.sendMessage({
          idticket: ticket.idticket,
          idemisor,
          idreceptor,
          contenido: mensaje.contenido,
          fecha_envio: mensaje.fecha_envio
          
        })
        
      
        socket.broadcast.to([idreceptor,idemisor]).emit("chat:mensaje-nuevo",mensajeCreado)
        cb(mensajeCreado)
      }catch(e){
        console.log(e)
      }
      
      
    }
  }
}

export default chatEvents;