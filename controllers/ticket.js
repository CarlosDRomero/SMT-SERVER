import { ticketModel } from "../models/ticket.js"
import { notificacionPayloadFactory } from "../services/notificaciones.js"

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
      email: cliente.email,
      asunto: "Solicitud de servicio aceptada"
    },
    fuente: ticket.idticket,
    iniciador: tecnico.idusuario,
    objetivo: cliente?.idusuario,
    mensaje: `El tecnico ${tecnico.nombres} ha aceptado su solicitud`
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
    const tickets = await ticketModel.findAll()
    res.json(tickets)
  },
  obtenerTicket: async (req, res) => {
    const { idticket } = req.params
    const ticket = await ticketModel.findById(idticket)
    res.json(ticket)
  },
  obtenerTicketUsuario: async (req, res) => {
    const { idusuario } = req.usuario
    const { idticket } = req.params
    const ticket = await ticketModel.findByUsuario(idusuario, idticket)
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
    const { idusuario } = req.usuario
    const ticket = await ticketModel.findByUsuario(idusuario)
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
    console.log(usuario_notificar)
    req.payload = await crearNotificacionAsignacion(req.usuario, usuario_notificar, ticket);
    next();
  },
  agregarTipoServicio: async (req,res) => {
    const tag = await ticketModel.addTicketTag(req.body.tipo_servicio, req.body.descripcion)
    console.log(tag)
    res.json(tag)
  },
  obtenerTiposServicio: async (req,res) => {
    const tags = await ticketModel.getTicketTags()
    res.json(tags)
  }
}