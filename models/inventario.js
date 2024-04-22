import { poolClient } from "../database/conexion.js";

export const inventarioModel = {
  findAll: async () => {
    const query = {
      name: "obtener-componentes-inventario",
      text: "SELECT * FROM inventario i JOIN componente c ON i.idcomponente=c.idcomponente"
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  findById: async (idproducto) => {
    const query = {
      name: "obtener-componentes-inventario-id",
      text: `
        SELECT * FROM inventario i 
        JOIN componente c ON i.idcomponente=c.idcomponente
        WHERE idproducto=$1
      `,
      values: [idproducto]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  crear: async (productoInfo) => {
    const query = {
      name: "crear-componentes-inventario",
      text: "INSERT INTO inventario (idcomponente, sku, disponibilidad, precio) VALUES ($1,$2,$3,$4)",
      values: [
        productoInfo.idcomponente,
        productoInfo.sku,
        productoInfo.disponibilidad,
        productoInfo.precio
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  actualizar: async (idproducto, productoInfo) => {
    const query = {
      name: "actualizar-componentes-inventario",
      text: "UPDATE inventario SET sku=$1, disponibilidad=$2, precio=$3 WHERE idproducto=$4 RETURNING *",
      values: [
        productoInfo.sku,
        productoInfo.disponibilidad,
        productoInfo.precio,
        idproducto
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  eliminar: async (idproducto) => {
    const query = {
      name: "eliminar-componentes-inventario",
      text: "DELETE FROM inventario WHERE idproducto=$1",
      values: [idproducto]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  }
}