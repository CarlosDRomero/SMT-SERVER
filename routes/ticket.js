import { Router } from "express"
import { ticketController } from "../controllers/ticket.js";
import { checkValidator, extraerUsuario, gestionarUsuario, verificarRol } from "../middlewares.js";
import { rolesUsuario, usuarioController } from "../controllers/usuario.js";
import { UUIDParamValidator } from "../validators/general_validators.js";
import { ticketNuevoValidator, ticketProcessValidator } from "../validators/ticket_validator.js";
import { notificacionController } from "../controllers/notificacion.js";

const ticketRouter = Router();
ticketRouter.post("/",
  ticketNuevoValidator,
  checkValidator,
  usuarioController.validarEmailCliente,
  ticketController.crearTicket
);

ticketRouter.get("/",
  extraerUsuario,
  verificarRol([rolesUsuario.CLIENTE]),
  ticketController.obtenerTicketsUsuario
);

ticketRouter.get("/clasificaciones",
  extraerUsuario,
  verificarRol([rolesUsuario.ADMIN, rolesUsuario.EMPLEADO]),
  ticketController.obtenerClasificaciones
);

ticketRouter.post("/clasificaciones",
  extraerUsuario,
  verificarRol([rolesUsuario.ADMIN]),
  ticketController.agregarClasificacion
);

ticketRouter.get("/gestionar",
  extraerUsuario,
  verificarRol([rolesUsuario.ADMIN, rolesUsuario.EMPLEADO]),
  ticketController.obtenerTickets
);

ticketRouter.get("/gestionar/:idticket",
  extraerUsuario,
  verificarRol([rolesUsuario.ADMIN, rolesUsuario.EMPLEADO]),
  UUIDParamValidator("idticket"),
  checkValidator,
  ticketController.obtenerTicket
);
ticketRouter.get("/:idticket",
  extraerUsuario,
  verificarRol([rolesUsuario.CLIENTE]),
  UUIDParamValidator("idticket"),
  checkValidator,
  ticketController.obtenerTicketUsuario
);


ticketRouter.put("/aceptar/:idticket",
  extraerUsuario,
  verificarRol([rolesUsuario.EMPLEADO]),
  UUIDParamValidator("idticket"),
  checkValidator,
  // ticketController.validarNoAceptado,
  ticketController.asignarEmpleado,
  notificacionController.notificar
);

ticketRouter.put("/gestionar/:idticket",
  extraerUsuario,
  verificarRol([rolesUsuario.ADMIN, rolesUsuario.EMPLEADO]),
  UUIDParamValidator("idticket"),
  ticketProcessValidator,
  checkValidator,
  ticketController.gestionarTicket,
  
);



ticketRouter.get("/gestionar/:idusuario",
  extraerUsuario,
  verificarRol([rolesUsuario.ADMIN, rolesUsuario.EMPLEADO]),
  UUIDParamValidator("idusuario"),
  checkValidator,
  gestionarUsuario(rolesUsuario.CLIENTE),
  ticketController.obtenerTicketsUsuario
);

// ticketRouter.put("/:idticket", ticketController.actualizarTicket);
// ticketRouter.delete("/ticket/:idticket", ticketController.eliminarTicket);

export default ticketRouter;