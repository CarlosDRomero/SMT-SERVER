import { poolClient } from "../database/conexion.js";

export const ticketModel = {
  findById: async (idticket) => {
    const query = {
      name: "obtener-ticket",
      text:
      `SELECT t.*, u.idusuario, u.nombres, u.apellidos 
      FROM ticket t 
      LEFT JOIN usuario u ON t.email=u.email  
      WHERE idticket=$1`,

      values: [idticket]
    }

    const result = await poolClient.query(query);
    return result.rows[0];
  },
  findUsuarioTicket: async (idticket) => {
    const query = {
      name: "obtener-usuario-ticket",
      text:
      `SELECT u.* 
      FROM usuario u 
      JOIN ticket t ON t.email=u.email OR t.idusuario=u.idusuario  
      WHERE idticket=$1`,

      values: [idticket]
    }

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
  findByEmail: async (email) => {
    const query = {
      name: "obtener-tickets-email",
      text: "SELECT * FROM ticket WHERE idusuario=$1",
      values: [email]
    }

    const result = await poolClient.query(query);
    return result.rows;
  },
  findOneByUsuario: async (idusuario, idticket) => {
    const query = {
      name: "obtener-tickets-usuario",
      text: "SELECT * FROM ticket WHERE idusuario=$1 AND idticket=$2",
      values: [idusuario, idticket]
    }

    const result = await poolClient.query(query);
    return result.rows[0];
  },
  findOneByEmail: async (email, idticket) => {
    const query = {
      name: "obtener-tickets-usuario",
      text: "SELECT * FROM ticket WHERE email=$1 AND idticket=$2",
      values: [email, idticket]
    }

    const result = await poolClient.query(query);
    return result.rows[0];
  },
  findAll: async () => {
    const query = {
      name: "obtener-tickets",
      text: "SELECT * FROM ticket"
    }

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
      name: "gestionar-ticket",
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
        ticketInfo.prioridad,
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
  }
}