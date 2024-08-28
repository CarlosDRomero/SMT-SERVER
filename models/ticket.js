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
  solveTicket: async (idticket,{ idusuario, rol }) => {
    const query = {
      name: "resolver-ticket",
      text:
      `UPDATE ticket SET estado='resuelto'
      WHERE idticket=$1 AND (empleado_asignado=$2 OR $3='admin') RETURNING *`,
      values: [idticket,idusuario, rol]
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
  getTicketGrade: async ({ idticket, usuario }) => {
    const query = {
      name:"obtener-calificacion-ticket",
      text: `
      SELECT valor, comentario FROM calificacion_ticket c 
      JOIN ticket t ON c.idticket=t.idticket
      WHERE t.idticket=$1 AND (t.idusuario=$2 OR t.empleado_asignado=$2 OR $3='admin')
      `,
      values: [
        idticket, usuario.idusuario, usuario.rol
      ]
    }
    const result = await poolClient.query(query);
    return result.rows[0];
  },
  calificarTicket: async (idticket,{ valor, comentario }) => {
    const query = {
      name:"calificar-ticket",
      text: "INSERT INTO calificacion_ticket(idticket, valor, comentario) VALUES ($1,$2,$3) RETURNING valor, comentario",
      values: [
        idticket, valor, comentario
      ]
    }
    console.log(query.values)
    const result = await poolClient.query(query);
    return result.rows[0];
  },
  setTicketState: async (estado, idticket) => {
    const query = {
      name:"actualizar-estado-ticket",
      text: "UPDATE ticket SET estado=$1 WHERE idticket=$2 RETURNING *",
      values: [
        estado,idticket
      ]
    }
    console.log(query.values)
    const result = await poolClient.query(query);
    return result.rows[0];
  },
  requestReopen: async (idticket, idusuario) => {
    const query = {
      name:"solicitar-reapertura-ticket",
      text: "UPDATE ticket SET estado='en proceso' WHERE idticket=$1 AND idusuario=$2 RETURNING *",
      values: [
        idticket, idusuario
      ]
    }
    console.log(query.values)
    const result = await poolClient.query(query);
    return result.rows[0];
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
  getTicketTag: async (idticket) => {
    const query = {
      name: "obtener-servicio-ticket",
      text: `
        SELECT tipo_servicio FROM tipo_servicio s
        JOIN ticket t ON t.idtipo_servicio = s.idtipo_servicio
        WHERE t.idticket=$1
      `,
      values: [idticket]
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
      text: "UPDATE ticket SET empleado_asignado=$1 WHERE idticket=$2 RETURNING *",
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
  addTicketTag: async ({ tipo_servicio, descripcion,url_imagen }) => {
    const query = {
      name: "crear-clasificacion-ticket",
      text: "INSERT INTO tipo_servicio (tipo_servicio, descripcion, url_imagen) VALUES ($1, $2,$3) RETURNING *",
      values: [tipo_servicio, descripcion, url_imagen]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  updateTicketTag: async (idtipo_servicio,{ tipo_servicio, descripcion,url_imagen }) => {
    const query = {
      name: "actualizar-clasificacion-ticket",
      text: "UPDATE tipo_servicio SET tipo_servicio=$1, descripcion=$2, url_imagen=$3 WHERE idtipo_servicio=$4 RETURNING *",
      values: [tipo_servicio, descripcion, url_imagen, idtipo_servicio]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  deleteTicketTag: async (idtipo_servicio) => {
    const query = {
      name: "borrar-clasificacion-ticket",
      text: "DELETE FROM tipo_servicio WHERE idtipo_servicio=$1 RETURNING *",
      values: [idtipo_servicio]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  getTicketTags: async () => {
    const query = {
      name: "obtener-clasificacion-ticket",
      text: "SELECT * FROM tipo_servicio ORDER BY idtipo_servicio"
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