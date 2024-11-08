import { poolClient } from "../database/conexion.js";
import { applyCursorPagination, multiInsertFactory } from "../utils.js";

export const promocionesModel = {
  createOffer: async (infoOferta) => {
    const query = {
      name: "crear-oferta",
      text: `
      INSERT INTO oferta (asunto,descripcion,porcentaje,idcategoria,idproducto,fecha_inicio,fecha_fin)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
      `,
      values: [
        infoOferta.asunto,
        infoOferta.descripcion,
        infoOferta.porcentaje,
        infoOferta.idcategoria,
        infoOferta.idproducto,
        infoOferta.fecha_inicio,
        infoOferta.fecha_fin,
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  updateOffer: async (infoOferta, idoferta) => {
    const query = {
      name: "actualizar-oferta",
      text: `
      UPDATE oferta SET asunto = $1,descripcion = $2,porcentaje = $3,idcategoria = $4,idproducto = $5,fecha_inicio = $6,fecha_fin = $7 
      WHERE idoferta = $8
      RETURNING *
      `,
      values: [
        infoOferta.asunto,
        infoOferta.descripcion,
        infoOferta.porcentaje,
        infoOferta.idcategoria,
        infoOferta.idproducto,
        infoOferta.fecha_inicio,
        infoOferta.fecha_fin,
        idoferta,
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  pageOffers: async (cursor, cursorSchema) => {
    const query = {
      text: "SELECT *, (current_date BETWEEN fecha_inicio AND fecha_fin) activa FROM oferta"
    }
    const paginationQuery = applyCursorPagination(query, cursor, cursorSchema)
    const res = await poolClient.query(paginationQuery);
    return res.rows;
  },
  getOfferById: async (idoferta) => {
    const query = {
      name: "obtener-oferta-id",
      text: "SELECT *, (current_date BETWEEN fecha_inicio AND fecha_fin) activa FROM oferta WHERE idoferta = $1",
      values: [idoferta]
    }
    const res = await poolClient.query(query);
    return res.rows[0];
  },

  getOffers: async () => {
    const query = {
      name: "obtener-ofertas",
      text: "SELECT * FROM oferta"
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  getActiveOffers: async () => {
    const query = {
      name: "obtener-ofertas-activas",
      text: "SELECT * FROM ofertas_activas"
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  getOverlappingOffer: async ({ idcategoria, idproducto, fecha_inicio, fecha_fin }) => {
    const query = {
      name: "obtener-ofertas-activas-tipo",
      text: `
      SELECT * FROM oferta WHERE 
      ((idcategoria=$1 AND idproducto IS NULL) OR (idproducto=$2 AND idcategoria IS NULL)) AND
      fecha_inicio<=$4 AND fecha_fin>=$3
      `,
      values: [idcategoria, idproducto, fecha_inicio, fecha_fin]
    }
    const res = await poolClient.query(query);
    return res.rows;
  },
  createCoupon: async (infoCupon) => {
    const query = {
      name: "crear-cupon",
      text: `
      INSERT INTO cupon (asunto,descripcion,porcentaje,cantidad,duracion,min_compras,min_gastado)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
      `,
      values: [
        infoCupon.asunto,
        infoCupon.descripcion,
        infoCupon.porcentaje,
        infoCupon.cantidad,
        infoCupon.duracion,
        infoCupon.min_compras,
        infoCupon.min_gastado
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  updateCoupon: async (infoCupon, idcupon) => {
    const query = {
      name: "actualizar-cupon",
      text: `
      UPDATE cupon SET asunto = $1,descripcion = $2,porcentaje = $3,cantidad = $4,duracion = $5,min_compras = $6, min_gastado = $7 
      WHERE idcupon = $8
      RETURNING *
      `,
      values: [
        infoCupon.asunto,
        infoCupon.descripcion,
        infoCupon.porcentaje,
        infoCupon.cantidad,
        infoCupon.duracon,
        infoCupon.min_compras,
        infoCupon.min_gastado,
        idcupon,
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  getCouponsByUserId: async (idusuario) => {
    const query = {
      name: "obtener-cupones-usuario",
      text: `
      SELECT * FROM cupones_usuarios WHERE idusuario=$1
      `,
      values: [idusuario]
    }
    const res = await poolClient.query(query);
    return res.rows;
  },
  checkCouponByUserId: async (idcupon, idusuario) => {
    const query = {
      name: "verificar-cupon-usuario",
      text: `
      SELECT * FROM cupones_usuarios WHERE idcupon = $1 AND idusuario=$2 AND NOT usado AND NOT expirado
      `,
      values: [idcupon,idusuario]
    }
    const res = await poolClient.query(query);
    return res.rows[0];
  },
  markAsUsed: async (idcupon, idusuario) => {
    const query = {
      name: "marcar-cupon-usado",
      text: `
      UPDATE cupon_usuario SET usado = TRUE WHERE idcupon = $1 AND idusuario=$2
      `,
      values: [idcupon,idusuario]
    }
    const res = await poolClient.query(query);
    return res.rows[0];
  },
  getCoupons: async () => {
    const query = {
      name: "obtener-cupones-usuario",
      text: "SELECT * FROM cupones_usuarios"
    }
    const res = await poolClient.query(query);
    return res.rows;
  },
  getOverlappingCoupon: async ({ porcentaje, cantidad, duracion, min_compras, min_gastado }) => {
    const query = {
      name: "obtener-ofertas-activas-tipo",
      text: `
      SELECT * FROM oferta WHERE 
      porcentaje = $1 AND cantidad = $2 AND duracion = $3 AND min_compras = $4 AND min_gastado = $5
      `,
      values: [porcentaje, cantidad, duracion, min_compras, min_gastado]
    }
    const res = await poolClient.query(query);
    return res.rows[0];
  },
  findCouponBy: async (conditions) => {
    const query = {
      text: `
      SELECT * FROM cupon 
      `,
      values: []
    }
    for (const condIndStr in conditions){
      
      const condInd = Number(condIndStr)
      let whereClause = "";
      const condition = conditions[condInd]
      
      if (condInd === 0) whereClause = `WHERE ${condition.field} `
      else whereClause += ` AND ${condition.field} `


      let op;
      if (condition.gt !== undefined) {
        op = ">"
        query.values.push(condition.gt)
      }
      else if (condition.lt !== undefined) {
        op = "<"
        query.values.push(condition.lt)
      }
      else if (condition.min !== undefined) {
        op = ">="
        query.values.push(condition.min)
      }
      else if (condition.max !== undefined) {
        op = "<="
        query.values.push(condition.max)
      }
      else if (condition.eq !== undefined) {
        op = "="
        query.values.push(condition.eq)
      }
      whereClause += `${op} $${condInd + 1}`
      
      
      query.text += whereClause
    }
    const res = await poolClient.query(query);
    return res.rows[0];
  },
  assignCouponToUser: async (idcupon, idusuario) => {
    const query = {
      name: "asignar-cupon-usuario",
      text: `
      INSERT INTO cupon_usuario (idcupon, idusuario) VALUES ($1,$2)
      RETURNING *
      `,
      values: [idcupon, idusuario]
    }
    const res = await poolClient.query(query);
    return res.rows[0];
  },
  assignCouponsToUser: async (cupones, idusuario) => {
    const query = {
      text: "INSERT INTO cupon_usuario (idcupon, idusuario) VALUES",
      values: []
    }
    multiInsertFactory(query, cupones.map(c => [c.idcupon, idusuario]))
    const res = await poolClient.query(query);
    return res.rows;
  },

  
}

