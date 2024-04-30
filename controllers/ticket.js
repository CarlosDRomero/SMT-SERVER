import { ticketModel } from "../models/ticket.js"
import { notificacionPayloadFactory, notificacionService } from "../services/notificaciones.js"

const crearNotificacionNuevo = (cliente, roles, idticket, mensaje) => {
  return notificacionPayloadFactory({
    tipo: "rol",
    idevento: 3,
    emailPayload:{
      // email: ticket.email,
      asunto: "Solicitud de servicio aceptada"
    },
    fuente: idticket,
    iniciador: cliente?.idusuario,
    objetivo: roles,
    mensaje
  })
}

const crearNotificacionAsignacion = (tecnico, cliente, ticket) => {
  return notificacionPayloadFactory({
    tipo: "directa",
    idevento: 4,
    emailPayload:{
      email: ticket.email,
      asunto: "Solicitud de servicio aceptada"
    },
    fuente: ticket.idticket,
    iniciador: tecnico.idusuario,
    objetivo: cliente?.idusuario,
    mensaje: `El tecnico ${tecnico.nombres} ha aceptado su solicitud`
  })
}

export const ticketController = {
  crearTicket: async (req, res, next) => {
    const ticketNuevo = await ticketModel.createTicket(req.body)

    res.status(201).json(ticketNuevo)
    const usuarioTicket = await ticketModel.findUsuarioTicket(ticketNuevo.idticket);
    //TODO NOTIFICACIONES A VARIOS ROLES A LA VEZ y VARIOS CORREOS
    req.payload = crearNotificacionNuevo(usuarioTicket,  "empleado", ticketNuevo.idticket, `Hay un nuevo ticket: ${ticketNuevo.asunto}`)
    next()
  },
  obtenerTickets: async (req, res) => {
    const tickets = await ticketModel.findAll()
    res.json(tickets)
  },
  obtenerTicket: async (req, res) => {
    const { idticket } = req.params
    const ticket = await ticketModel.findById(idticket)
    res.json(ticket)
  },
  obtenerTicketUsuario: async (req, res) => {
    const { email } = req.usuario
    const { idticket } = req.params
    const ticket = await ticketModel.findByUsuario(email, idticket)
    if (!ticket) return res.status(403).json({ error: "No tiene permisos para esta accion" })
    res.json(ticket)
  },
  gestionarTicket: async (req, res, next) => {
    const { idticket } = req.params
    const ticket = await ticketModel.manageTicket(req.body,idticket)
    if (!ticket) return next({ name: "RecursoNoEncontrado", message: "Ticket no encontrado" })
    res.json(ticket)
  },
  obtenerTicketsUsuario: async (req, res) => {
    const { email } = req.usuario
    const ticket = await ticketModel.findByUsuario(email)
    res.json(ticket)
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
    req.payload = crearNotificacionAsignacion(req.usuario, usuario_notificar, ticket);
    next();
  },
  agregarClasificacion: async (req,res) => {
    const tag = await ticketModel.addTicketTag(req.body.clasificacion)
    console.log(tag)
    res.json(tag)
  },
  obtenerClasificaciones: async (req,res) => {
    const tags = await ticketModel.getTicketTags()
    res.json(tags)
  }
}