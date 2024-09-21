import { poolClient } from "../database/conexion.js"

export const carritoComprasModel = {
  findProductInCart: async (idusuario, idproducto) => {
    const query = {
      name: "obtener-producto-carrito",
      text: "SELECT * FROM producto_carrito WHERE idcarrito=obtener_carrito($1) AND idproducto=$2",
      values: [idusuario, idproducto]
    }
    const res = await poolClient.query(query);
    return res.rows[0];
  },
  addToCart: async (idcliente,idproducto, cantidad) => {
    const query = {
      name: "agregar-producto-carrito",
      text: "SELECT * FROM agregar_a_carrito($1,$2,$3)",
      values: [idcliente, idproducto, cantidad]
    }
    const res = await poolClient.query(query);
    return res.rows[0];
  },
  removeFromCart: async (idproducto) => {
    const query = {
      name: "remover-producto-carrito",
      text: "DELETE FROM producto_carrito WHERE idproducto=$1 RETURNING *",
      values: [idproducto]
    }
    const res = await poolClient.query(query);
    return res.rows[0];
  },
  getCartProductsByUser: async (idusuario) => {
    const query = {
      name: "obtener-productos-carrito-usuario",
      text: "SELECT idproducto, cantidad FROM obtener_producto_carrito_usuario($1)",
      values: [idusuario]
    }
    const res = await poolClient.query(query);
    return res.rows;
  },
  getOneProductByUser: async (idusuario,idproducto) => {
    const query = {
      name: "obtener-producto-carrito-usuario",
      text: "SELECT idproducto, cantidad FROM obtener_producto_carrito_usuario($1) WHERE idproducto=$2",
      values: [idusuario,idproducto]
    }
    const res = await poolClient.query(query);
    return res.rows;
  },
  getProductsInfoByUser: async (idusuario) => {
    const query = {
      name: "obtener-info-producto-usuario",
      text: "SELECT * FROM obtener_productos_info($1) as i JOIN producto c ON i.idproducto=c.idproducto",
      values: [idusuario]
    }
    const res = await poolClient.query(query);
    return res.rows;
  }

}