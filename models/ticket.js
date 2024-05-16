import { poolClient } from "../database/conexion.js";

export const ticketModel = {
  findById: async (idticket) => {
    const query = {
      name: "obtener-ticket",
      text:
      "SELECT * FROM ticket WHERE idticket=$1",
      values: [idticket]
    }

    const result = await poolClient.query(query);
    return result.rows[0];
  },
  findUsuarioTicket: async (idticket) => {
    const query = {
      name: "obtener-usuario-ticket",
      text:
      `SELECT u.idusuario, u.email, u.nombres, u.apellidos 
      FROM usuario u 
      JOIN ticket t ON t.idusuario=u.idusuario
      WHERE t.idticket=$1`,
      values: [idticket]
    }

    const result = await poolClient.query(query);
    return result.rows[0];
  },
  discardTicketUser: async (idusuario, idticket) => {
    const query = {
      name: "descartar-ticket-usuario",
      text:
      `UPDATE ticket SET estado='cerrado'
      WHERE idusuario=$1 AND idticket=$2 RETURNING *`,
      values: [idusuario,idticket]
    }

    const result = await poolClient.query(query);
    return result.rows[0];
  },
  discardTicket: async (idticket) => {
    const query = {
      name: "descartar-ticket",
      text:
      `UPDATE ticket SET estado='cerrado'
      WHERE idticket=$1 RETURNING *`,
      values: [idticket]
    }

    const result = await poolClient.query(query);
    return result.rows[0];
  },
  reopenTicket: async (idticket) => {
    const query = {
      name: "reabrir-ticket",
      text: "SELECT * FROM reabrir_ticket($1)",
      values: [idticket]
    }

    const result = await poolClient.query(query);
    return result.rows[0];
  },
  findEmpleadoTicket: async (idticket) => {
    const query = {
      name: "obtener-empleado-ticket",
      text:
      `SELECT u.idusuario, u.email, u.nombres, u.apellidos 
      FROM usuario u 
      JOIN ticket t ON t.empleado_asignado=u.idusuario
      WHERE t.idticket=$1`,
      values: [idticket]
    }
    console.log("query",query.text)
    const result = await poolClient.query(query);
    return result.rows[0];
  },
  findByUsuario: async (idusuario) => {
    const query = {
      name: "obtener-tickets-usuario",
      text: "SELECT * FROM ticket WHERE idusuario=$1",
      values: [idusuario]
    }

    const result = await poolClient.query(query);
    return result.rows;
  },
  findOneByUsuario: async (idusuario,idticket) => {
    const query = {
      name: "obtener-ticket-usuario",
      text: "SELECT * FROM ticket WHERE idusuario=$1 AND idticket=$2",
      values: [idusuario, idticket]
    }

    const result = await poolClient.query(query);
    return result.rows[0];
  },
  findByEmail: async (email) => {
    const query = {
      name: "obtener-tickets-email",
      text: "SELECT * FROM ticket WHERE idusuario=$1",
      values: [email]
    }

    const result = await poolClient.query(query);
    return result.rows;
  },
  findOneByEmail: async (email, idticket) => {
    const query = {
      name: "obtener-tickets-email",
      text: "SELECT * FROM ticket WHERE email=$1 AND idticket=$2",
      values: [email, idticket]
    }

    const result = await poolClient.query(query);
    return result.rows[0];
  },
  findAll: async () => {
    console.log("buscando tickets")
    const query = {
      name:"obtener-tickets",
      text: "SELECT * FROM ticket",

    }

    const result = await poolClient.query(query);
    return result.rows;
  },
  filterTickets: async (parametros) => {
    console.log("filtrando tickets")
    const query = {
      name:"filtrar-tickets",
      text: "SELECT * FROM ticket WHERE idusuario=$1 OR email=$2",
      values: [
        parametros?.idusuario,
        parametros?.email,
      ]
    }
    console.log(query.values)
    const result = await poolClient.query(query);
    return result.rows;
  },
  createTicketEmail: async (ticketInfo) => {
    const query = {
      name: "crear-ticket-email",
      text: "INSERT INTO ticket (email, asunto, contenido) VALUES ($1, $2, $3) RETURNING *",
      values: [
        ticketInfo.email,
        ticketInfo.asunto,
        ticketInfo.contenido
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  createTicketUser: async (idusuario,ticketInfo) => {
    const query = {
      name: "crear-ticket-usuario",
      text: "INSERT INTO ticket (idusuario, asunto, contenido) VALUES ($1, $2, $3) RETURNING *",
      values: [
        idusuario,
        ticketInfo.asunto,
        ticketInfo.contenido
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  assignEmployee: async (idempleado, idticket) => {
    const query = {
      name: "asignar-ticket",
      text: "UPDATE ticket SET empleado_asignado=$1, estado='aceptado' WHERE idticket=$2 RETURNING *",
      values: [
        idempleado,
        idticket
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  manageTicket: async (ticketInfo, idticket) => {
    const query = {
      name: "gestionar-ticket",
      text: "UPDATE ticket SET idtipo_servicio=$1, prioridad=$2 WHERE idticket=$3 RETURNING *",
      values: [
        ticketInfo.idtipo_servicio,
        ticketInfo.prioridad.toLowerCase(),
        idticket
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  addTicketTag: async (tag, descripcion) => {
    const query = {
      name: "crear-clasificacion-ticket",
      text: "INSERT INTO tipo_servicio (tipo_servicio, descripcion) VALUES ($1, $2) RETURNING *",
      values: [tag, descripcion]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  getTicketTags: async () => {
    const query = {
      name: "obtener-clasificacion-ticket",
      text: "SELECT * FROM tipo_servicio"
    }

    const res = await poolClient.query(query);
    return res.rows
  },
  getEstadosTickets: async () => {
    const query = {
      name:"estados-tickets",
      text: "SELECT * FROM vista_estados_ticket"
    }
    const res = await poolClient.query(query);
    return res.rows
  },
  getPrioridadTickets: async () => {
    const query = {
      name:"prioridad-tickets",
      text: "SELECT * FROM vista_priorida_ticket"
    }
    const res = await poolClient.query(query);
    return res.rows
  }

}