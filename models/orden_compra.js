import { poolClient } from "../database/conexion.js"
import { multiInsertFactory } from "../utils.js";

export const ordenCompraModel = {
  addOrder: async(ordenInfo, idusuario) => {
    const query = {
      name: "crear-orden",
      text: "INSERT INTO orden_compra (idusuario, iddireccion, costo_total, costo_final) VALUES ($1, $2, $3, $4) RETURNING *",
      values: [
        idusuario,
        ordenInfo.iddireccion,
        ordenInfo.costo_total,
        ordenInfo.costo_final
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },

  addProductstoOrder: async(listaProductos, idorden) => {
    const query = {
      text: "INSERT INTO producto_orden (idorden, idproducto, cantidad, costo) VALUES",
      values: []
    }
    multiInsertFactory(query, listaProductos.map(product => [idorden, product.idproducto, product.cantidad, product.costo]))
    const res = await poolClient.query(query);
    return res.rows[0];
  },
  getOrdersByUser: async (idusuario) => {
    const query = {
      name: "obtener-ordenes-compra-usuario",
      text: "SELECT * FROM orden_compra WHERE idusuario = $1",
      values: [idusuario]
    }
    const res = await poolClient.query(query);
    return res.rows;
  },

  getProductsOrder: async (idorden) => {
    const query = {
      name: "obtener-productos-orden-compra",
      text: "SELECT p.*, po.costo, po.cantidad FROM producto_orden po JOIN orden_compra oc ON po.idorden = oc.idorden JOIN producto_oferta p ON po.idproducto = p.idproducto WHERE po.idorden = $1",
      values: [idorden]
    }
    const res = await poolClient.query(query);
    return res.rows;
  },
  getPendingCoupons: async (idusuario) => {
    const query = {
      name: "obtener-cupones-pendientes",
      text: `
      SELECT c.* FROM cupon c LEFT JOIN cupon_usuario cu ON cu.idcupon = c.idcupon
      WHERE cu.idusuario IS NULL AND  min_compras <= (SELECT count(*) FROM orden_compra oc JOIN producto_orden po ON oc.idorden = po.idorden WHERE idusuario=$1);
      `,
      values: [idusuario]
    }
    const res = await poolClient.query(query);
    return res.rows;
  },

}