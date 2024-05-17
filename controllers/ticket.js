import { ticketModel } from "../models/ticket.js"
import { notificacionPayloadFactory } from "../services/notificaciones.js"
import { reqOnline } from "../socket/utilidades.js"
import { rolesUsuario } from "./usuario.js"

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


export const ticketController = {
  crearTicketUsuario: async (req, res, next) => {
    const { idusuario } = req.usuario;
    const ticketNuevo = await ticketModel.createTicketUser(idusuario,req.body)
    res.status(201).json(ticketNuevo)
    console.log("CREANDO TICKET A USUARIO")
    req.payload = await generarNotificacionNuevo(ticketNuevo)
    next()
  },
  crearTicketEmail: async (req, res, next) => {
    const ticketNuevo = await ticketModel.createTicketEmail(req.body)

    res.status(201).json(ticketNuevo)
    req.payload = await generarNotificacionNuevo(ticketNuevo)
    next()
  },
  obtenerTickets: async (req, res) => {
    let tickets;
    const { rol,idusuario } = req.usuario
    if (Object.keys(req.query).length > 0) tickets = await ticketModel.filterTickets(req.query)
    else tickets = await ticketModel.findAll()
    if (rol === rolesUsuario.EMPLEADO){
      tickets = tickets.filter(ticket => !ticket.empleado_asignado || ticket.empleado_asignado === idusuario)
    } else if (rol === rolesUsuario.ADMIN){
      await Promise.all(tickets.map(async t => {
        if (t.empleado_asignado) {
          t.empleado = await ticketModel.findEmpleadoTicket(t.idticket)
          reqOnline(t.empleado)
        }
      }))
    }
    await Promise.all(tickets.map(async t => {
      if (t.idusuario) {
        t.usuario = await ticketModel.findUsuarioTicket(t.idticket)
        reqOnline(t.usuario)
      }
    }))
    
    res.json(tickets)
  },
  obtenerTicket: async (req, res, next) => {
    const { idticket } = req.params
    const ticket = await ticketModel.findById(idticket)
    if (!ticket) return next({ name: "RecursoNoEncontrado", message: "Ticket no encontrado" })
    if (ticket.idusuario) {

      ticket.usuario = await ticketModel.findUsuarioTicket(ticket.idticket)
      reqOnline(ticket.usuario)
    }
    res.json(ticket)
  },
  obtenerTicketUsuario: async (req, res) => {
    const { idusuario } = req.usuario
    const { idticket } = req.params
    const ticket = await ticketModel.findOneByUsuario(idusuario, idticket)
    if (!ticket) return res.status(403).json({ error: "No tiene permisos para esta accion" })
    if (ticket.empleado_asignado) ticket.empleado = await ticketModel.findEmpleadoTicket(idticket)
    res.json(ticket)
  },
  gestionarTicket: async (req, res, next) => {
    const { idticket } = req.params
    const ticket = await ticketModel.manageTicket(req.body,idticket)
    if (!ticket) return next({ name: "RecursoNoEncontrado", message: "Ticket no encontrado" })
    res.json(ticket)
    const usuario_notificar = await ticketModel.findUsuarioTicket(ticket.idticket);
    console.log(usuario_notificar)
    req.payload = await crearNotificacionActualizacion(req.usuario, usuario_notificar, ticket);
    next();
  },
  obtenerTicketsUsuario: async (req, res) => {
    const { idusuario } = req.usuario
    let tickets = await ticketModel.findByUsuario(idusuario)
    await Promise.all(tickets.map(async t => {
      if (t.empleado_asignado) t.empleado = await ticketModel.findEmpleadoTicket(t.idticket)
    }))
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
    res.status(201).json(ticket)

    const usuario_notificar = await ticketModel.findUsuarioTicket(ticket.idticket);
    console.log(usuario_notificar)
    req.payload = await crearNotificacionAsignacion(req.usuario, usuario_notificar, ticket);
    next();
  },
  descartarTicketUsuario: async (req, res) => {
    const { idusuario } = req.usuario
    const { idticket } = req.params
    const ticket = await ticketModel.discardTicketUser(idusuario, idticket)
    if (!ticket) res.status(403).json({ error: "No tienes permisos de modificar los tickets de alguien más" })
    res.status(201).json(ticket)
  },
  reabrirTicket: async (req, res) => {
    const { idticket } = req.params
    const ticket = await ticketModel.reopenTicket(idticket)
    // const usuario_notificar = await ticketModel.findUsuarioTicket(ticket.idticket);
    // req.payload = await crearNotificacionDescartado(req.usuario, usuario_notificar, ticket);
    // next()
    res.status(201).json(ticket)
  },
  descartarTicket: async (req, res,next) => {
    const { idticket } = req.params
    const ticket = await ticketModel.discardTicket(idticket)
    if (!ticket) res.status(404).json({ error: "Ticket no encontrado" })
    console.log(ticket)
    res.status(201).json(ticket)
    const usuario_notificar = await ticketModel.findUsuarioTicket(ticket.idticket);
    req.payload = await crearNotificacionDescartado(req.usuario, usuario_notificar, ticket);
    next()
  },
  agregarTipoServicio: async (req,res) => {
    const tag = await ticketModel.addTicketTag(req.body.tipo_servicio, req.body.descripcion)
    console.log(tag)
    res.json(tag)
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