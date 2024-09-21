import { poolClient } from "../database/conexion.js";
import { multiInsertFactory } from "../utils.js";

export const productoModel = {
  findAll: async () => {
    const query = {
      name: "obtener-productos",
      text: "SELECT * FROM producto"
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  findById: async (idproducto) => {
    const query = {
      name: "obtener-producto-id",
      text: "SELECT * FROM producto WHERE idproducto=$1",
      values: [idproducto]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  findSpecsById: async (idproducto) => {
    const query = {
      name: "obtener-especificaciones-producto",
      text: `
        SELECT coe.idespec, atributo,valor FROM producto_espec  coe  
        JOIN atributo_espec ae ON ae.idespec = coe.idespec 
        WHERE idproducto=$1;
      `,
      values: [idproducto]
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  create: async (productoInfo) => {
    const query = {
      name: "crear-producto",
      text: "INSERT INTO producto (idcategoria, marca, nombre, disponibilidad, precio, descripcion, url_imagen) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      values: [
        productoInfo.idcategoria,
        productoInfo.marca,
        productoInfo.nombre,
        productoInfo.disponibilidad,
        productoInfo.precio,
        productoInfo.descripcion,
        productoInfo.url_imagen
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  createSpecs: async (idproducto, listaEspecificaciones) => {
    const query = {
      text: "INSERT INTO producto_espec (idespec, idproducto, valor) VALUES",
      values: []
    }
    multiInsertFactory(query, listaEspecificaciones.map(spec => [spec.idespec, idproducto, spec.valor]))
    const res = await poolClient.query(query);
    return res.rows;
  },
  update: async (idproducto,productoInfo) => {
    const query = {
      name: "actualizar-producto",
      text: "UPDATE producto SET idcategoria=$1, marca=$2, nombre=$3, disponibilidad=$4, precio=$5, descripcion=$6, url_imagen=$7 WHERE idproducto=$8 RETURNING *",
      values: [
        productoInfo.idcategoria,
        productoInfo.marca,
        productoInfo.nombre,
        productoInfo.disponibilidad,
        productoInfo.precio,
        productoInfo.descripcion,
        productoInfo.url_imagen,
        idproducto
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  updateSpec: async (idproducto, idespec,valor) => {
    const query = {
      name: "actualizar-especificaciones-producto",
      text: "UPDATE producto_espec SET valor=$1 WHERE idproducto=$2 AND idespec=$3 RETURNING *",
      values: [
        valor,
        idproducto,
        idespec
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  delete: async (idproducto) => {
    const query = {
      name: "eliminar-producto",
      text: "DELETE FROM producto WHERE idproducto=$1 RETURNING *",
      values: [idproducto]
    }

    const res = await poolClient.query(query);

    return res.rows[0];
  }
}