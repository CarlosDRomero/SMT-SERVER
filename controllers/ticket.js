import { env } from "../environment.js"
import { ticketModel } from "../models/ticket.js"
import { notificacionPayloadFactory } from "../services/notificaciones.js"
import { rolesUsuario } from "./usuario.js"


// TODO:IMPORTANTE > Refactorizar este codigo y ver en que sitio se coloca mejor

const crearNotificacionNuevo = (cliente, idticket, mensaje) => {
  return notificacionPayloadFactory({
    tipo: "rol",
    idevento: 3,
    fuente: idticket,
    iniciador: cliente?.idusuario,
    objetivo: ["admin", "empleado"],
    mensaje
  })
}
const crearNotificacionSolicitud = (cliente, ticket) => {
  return notificacionPayloadFactory({
    tipo: "rol",
    idevento: 4,
    fuente: ticket.idticket,
    iniciador: cliente.idusuario,
    objetivo: ["admin", "empleado"],
    mensaje: `${cliente.nombres} ${cliente.apellidos} ha solicitado la reapertura del ticket: ${ticket.asunto}`
  })
}

const crearNotificacionAsignacion = (tecnico, cliente, ticket) => {
  return notificacionPayloadFactory({
    tipo: "directa",
    idevento: 4,
    emailPayload:{
      email: cliente?.email || ticket.email,
      asunto: "Solicitud de servicio aceptada"
    },
    fuente: ticket.idticket,
    iniciador: tecnico.idusuario,
    objetivo: cliente?.idusuario,
    mensaje: `El tecnico ${tecnico.nombres} ha aceptado su solicitud`
  })
}
const crearNotificacionDescartado = (tecnico, cliente, ticket) => {
  return notificacionPayloadFactory({
    tipo: "directa",
    idevento: 4,
    fuente: ticket.idticket,
    iniciador: tecnico.idusuario,
    objetivo: cliente?.idusuario,
    mensaje: "Pronto te atenderemos"
  })
}
const crearNotificacionReabiertoCliente = (admin, cliente, ticket) => {
  return notificacionPayloadFactory({
    tipo: "directa",
    idevento: 4,
    fuente: ticket.idticket,
    iniciador: admin.idusuario,
    objetivo: cliente?.idusuario,
    mensaje: `El admin ${admin.nombres} ha reabierto su ticket: ${ticket.asunto}`
  })
}

const crearNotificacionReabiertoEmpleados = (admin, ticket) => {
  return notificacionPayloadFactory({
    tipo: "rol",
    idevento: 4,
    fuente: ticket.idticket,
    iniciador: admin.idusuario,
    objetivo: ["empleado"],
    mensaje: `Un ticket ha sido reabierto por ${admin.nombres}`
  })
}



const crearNotificacionResuelto = (tecnico, cliente, ticket) => {
  return notificacionPayloadFactory({
    tipo: "directa",
    idevento: 4,
    emailPayload:{
      email: cliente?.email || ticket.email,
      asunto: "Su ticket ha sido resuelto",
      anexos: `<a href="${env.FRONTEND_ORIGIN}/tickets/${ticket.idticket}">entra aquí para ver</a>`
    },
    fuente: ticket.idticket,
    iniciador: tecnico.idusuario,
    objetivo: cliente?.idusuario,
    mensaje: `El ${tecnico.rol} ${tecnico.nombres} ha resuelto tu ticket ¿Estas satisfecho con el servicio?`
  })
}

const crearNotificacionCalificacion = (cliente, ticket) => {
  return notificacionPayloadFactory({
    tipo: "directa",
    idevento: 4,
    fuente: ticket.idticket,
    iniciador: cliente.idusuario,
    objetivo: ticket.empleado_asignado,
    mensaje: `Su servicio ha sido calificado por: ${cliente.nombres} ${cliente.apellidos}`
  })
}

const crearNotificacionActualizacion = (tecnico, cliente, ticket) => {
  return notificacionPayloadFactory({
    tipo: "directa",
    idevento: 4,
    emailPayload:{
      email: cliente?.email || ticket.email,
      asunto: "Solicitud de servicio actualizada"
    },
    fuente: ticket.idticket,
    iniciador: tecnico.idusuario,
    objetivo: cliente?.idusuario,
    mensaje: "El estado de su solicitud ha cambiado"
  })
}
const generarNotificacionNuevo = async (ticketNuevo) => {
  const usuarioTicket = await ticketModel.findUsuarioTicket(ticketNuevo.idticket);
  return crearNotificacionNuevo(usuarioTicket, ticketNuevo.idticket, `Hay un nuevo ticket: ${ticketNuevo.asunto}`)
}


export const popularTicket = async (ticket, usuario,campos) => {
  for (let campo of campos){
    if (campo === "usuario") ticket.usuario = await ticketModel.findUsuarioTicket(ticket.idticket)
    if (campo === "empleado") ticket.empleado = await ticketModel.findEmpleadoTicket(ticket.idticket)
    if (campo === "calificacion") ticket.calificacion = await ticketModel.getTicketGrade({ idticket: ticket.idticket,usuario })
      
    ticket.tipo_servicio = (await ticketModel.getTicketTag(ticket.idticket))?.tipo_servicio
  }

}

export const popularTickets = (tickets, usuario, campos) => {
  return Promise.all(tickets.map(async t => await popularTicket(t, usuario, campos)))
}

export const ticketController = {
  crearTicketUsuario: async (req, res, next) => {
    const { idusuario } = req.usuario;
    const ticketNuevo = await ticketModel.createTicketUser(idusuario,req.body)
    res.status(201).json(ticketNuevo)
    req.payload = [await generarNotificacionNuevo(ticketNuevo)]
    next()
  },
  crearTicketEmail: async (req, res, next) => {
    const ticketNuevo = await ticketModel.createTicketEmail(req.body)

    res.status(201).json(ticketNuevo)

    req.payload = [await generarNotificacionNuevo(ticketNuevo)]
    next()
  },
  obtenerTickets: async (req, res) => {
    let tickets;
    const { rol, idusuario } = req.usuario;
    if (Object.keys(req.query).length > 0) tickets = await ticketModel.filterTickets(req.query)
    else tickets = await ticketModel.findAll()
    if (rol === rolesUsuario.EMPLEADO){
      tickets = tickets.filter(t => t.estado !== "cerrado" && (!t.empleado_asignado || t.empleado_asignado === idusuario))
      await popularTickets(tickets, req.usuario, ["usuario","calificacion"])
    }else if (rol === rolesUsuario.ADMIN){
      await popularTickets(tickets, req.usuario, ["empleado","usuario","calificacion"])
    }
    res.json(tickets)
  },
  obtenerTicket: async (req, res, next) => {
    const { idusuario, rol } = req.usuario
    const { idticket } = req.params
    const ticket = await ticketModel.findById(idticket)
    if (!ticket || ((ticket.empleado_asignado && ticket.empleado_asignado !== idusuario) && rol !== rolesUsuario.ADMIN || (rol !== rolesUsuario.ADMIN && ticket.estado === "cerrado"))) return next({ name: "RecursoNoEncontrado", message: "Ticket no encontrado" })
    if (ticket.idusuario) {
      await popularTicket(ticket, req.usuario, ["usuario","calificacion"])
    }
    res.json(ticket)
  },
  obtenerTicketUsuario: async (req, res) => {
    const { idusuario } = req.usuario
    const { idticket } = req.params
    const ticket = await ticketModel.findOneByUsuario(idusuario, idticket)
    if (!ticket) return res.status(403).json({ error: "No tiene permisos para esta accion" })
    await popularTicket(ticket, req.usuario, ["empleado","calificacion"])
    res.json(ticket)
  },
  gestionarTicket: async (req, res, next) => {
    const { idticket } = req.params
    const ticket = await ticketModel.manageTicket(req.body,idticket)
    if (!ticket) return next({ name: "RecursoNoEncontrado", message: "Ticket no encontrado" })
    await popularTicket(ticket, req.usuario, ["usuario","empleado","calificacion"])
    res.json(ticket)
    const usuario_notificar = await ticketModel.findUsuarioTicket(ticket.idticket);
    req.payload = [await crearNotificacionActualizacion(req.usuario, usuario_notificar, ticket)]
    next();
  },
  obtenerTicketsUsuario: async (req, res) => {
    const { idusuario } = req.usuario
    let tickets = await ticketModel.findByUsuario(idusuario)
    await popularTickets(tickets, req.usuario, ["empleado","calificacion"])
    res.json(tickets)
  },
  validarNoAceptado: async (req, res, next) => {
    const { idticket } = req.params
    const ticket = await ticketModel.findById(idticket)
    if (!ticket.empleado_asignado) return next();
    return res.status(409).json({ error: "Este ticket ya fue aceptado o asignado a un empleado" })
  },
  asignarEmpleado: async (req, res, next) => {
    const { idusuario } = req.usuario
    const { idticket } = req.params
    const ticket = await ticketModel.assignEmployee(idusuario, idticket)

    if (!ticket) return next({ name: "RecursoNoEncontrado", message: "Ticket no encontrado" })
    await popularTicket(ticket, req.usuario, ["usuario"])
    res.status(201).json(ticket)

    const usuario_notificar = await ticketModel.findUsuarioTicket(ticket.idticket);
    req.payload = [await crearNotificacionAsignacion(req.usuario, usuario_notificar, ticket)]
    next();
  },
  descartarTicketUsuario: async (req, res) => {
    const { idusuario } = req.usuario
    const { idticket } = req.params
    const ticket = await ticketModel.discardTicketUser(idusuario, idticket)
    if (!ticket) res.status(403).json({ error: "No tienes permisos de modificar los tickets de alguien más" })
    await popularTicket(ticket, req.usuario, ["empleado","calificacion"])
    res.status(201).json(ticket)
  
  },
  solicitarReapertura: async (req, res, next) => {
    const { idusuario } = req.usuario
    const { idticket } = req.params
    const ticket = await ticketModel.requestReopen(idticket, idusuario)
    if (!ticket) res.status(403).json({ error: "No tienes permisos de modificar los tickets de alguien más" })
    await popularTicket(ticket, req.usuario, ["empleado","calificacion"])
    res.status(201).json(ticket)
    req.payload = [await crearNotificacionSolicitud(req.usuario, ticket)]
    next()
  },
  reabrirTicket: async (req, res, next) => {
    const { idticket } = req.params
    const ticket = await ticketModel.reopenTicket(idticket)
    const usuario_notificar = await ticketModel.findUsuarioTicket(ticket.idticket);
    req.payload = [
      await crearNotificacionReabiertoCliente(req.usuario, usuario_notificar, ticket),
      await crearNotificacionReabiertoEmpleados(req.usuario, ticket)
    ]
    await popularTicket(ticket, req.usuario, ["empleado","usuario","calificacion"])
    res.status(201).json(ticket)
    next()
  },
  resolverTicket: async (req, res, next) => {
    const { idticket } = req.params
    const ticket = await ticketModel.solveTicket(idticket, req.usuario)
    const usuario_notificar = await ticketModel.findUsuarioTicket(ticket.idticket);
    req.payload = [await crearNotificacionResuelto(req.usuario, usuario_notificar, ticket)];
    await popularTicket(ticket, req.usuario, ["usuario","calificacion"])
    res.status(201).json(ticket)
    next()
  },
  descartarTicket: async (req, res,next) => {
    const { idticket } = req.params
    const ticket = await ticketModel.discardTicket(idticket)
    if (!ticket) res.status(404).json({ error: "Ticket no encontrado" })
    await popularTicket(ticket, req.usuario, ["empleado","usuario","calificacion"])
    res.status(201).json(ticket)
    const usuario_notificar = await ticketModel.findUsuarioTicket(ticket.idticket);
    req.payload = [await crearNotificacionDescartado(req.usuario, usuario_notificar, ticket)];
    next()
  },
  calificarTicket: async (req, res,next) => {
    const { idticket } = req.params
    const { idusuario } = req.usuario
    const pertenece = await ticketModel.findOneByUsuario(idusuario, idticket);
    if (!pertenece || !pertenece.empleado_asignado || pertenece.estado !== "resuelto") return res.status(403).json({ error: "No puedes calificar este ticket" })
    const calificacion_ticket = await ticketModel.calificarTicket(idticket, req.body)
    const actualizar_estado = await ticketModel.setTicketState("cerrado", idticket)
    actualizar_estado.calificacion = calificacion_ticket;
    await popularTicket(actualizar_estado, req.usuario, ["empleado"])
    res.status(201).json(actualizar_estado)
    req.payload = [await crearNotificacionCalificacion(req.usuario, actualizar_estado)];
    next()
  },
  agregarTipoServicio: async (req,res) => {
    const tag = await ticketModel.addTicketTag(req.body)
    console.log(tag)
    res.json(tag)
  },
  actualizarTipoServicio: async (req,res) => {
    const { idtipo_servicio } = req.params
    const tag = await ticketModel.updateTicketTag(idtipo_servicio,req.body)
    if (!tag) return res.status(403).status("Parace que este servicio ya no existe o no tienes los permisos para actualizarlo")
    res.status(201).json(tag)
  },
  eliminarTipoServicio: async (req,res) => {
    const { idtipo_servicio } = req.params
    const tag = await ticketModel.deleteTicketTag(idtipo_servicio)
    if (!tag) return res.status(403).status("Parace que este servicio ya no existe o no tienes los permisos para eliminarlo")
    res.status(201).json(tag)
  },
  obtenerTiposServicio: async (req,res) => {
    const tags = await ticketModel.getTicketTags()
    res.json(tags)
  },
  obtenerEstadosTickets: async (req,res) => {
    const estados = await ticketModel.getEstadosTickets()
    res.json(estados)
  },
  obtenerPrioridadTickets: async (req,res) => {
    const prioridades = await ticketModel.getPrioridadTickets()
    res.json(prioridades)
  }
}