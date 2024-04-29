import { poolClient } from "../database/conexion.js";
import { multiInsertFactory } from "../utils.js";

export const componenteModel = {
  findAll: async () => {
    const query = {
      name: "obtener-componentes",
      text: "SELECT * FROM componente"
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  findById: async (idcomponente) => {
    const query = {
      name: "obtener-componente-id",
      text: "SELECT * FROM componente WHERE idcomponente=$1",
      values: [idcomponente]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  findSpecsById: async (idcomponente) => {
    const query = {
      name: "obtener-especificaciones-componente",
      text: `
        SELECT cae.idcat_espec, atributo,valor FROM componente_espec  coe 
        JOIN categoria_espec cae  ON coe.idcat_espec =cae.idcat_espec 
        JOIN atributo_espec ae ON ae.idespec =cae.idespec 
        WHERE idcomponente=$1;
      `,
      values: [idcomponente]
    }

    const res = await poolClient.query(query);
    return res.rows;
  },
  create: async (componenteInfo) => {
    const query = {
      name: "crear-componente",
      text: "INSERT INTO componente (idcategoria, marca, nombre, descripcion, url_imagen) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      values: [
        componenteInfo.idcategoria,
        componenteInfo.marca,
        componenteInfo.nombre,
        componenteInfo.descripcion,
        componenteInfo.url_imagen
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  createSpecs: async (idcomponente, listaEspecificaciones) => {
    const query = {
      name: "crear-especificaciones-componente",
      text: "INSERT INTO componente_espec (idcat_espec, idcomponente, valor) VALUES",
      values: []
    }
    multiInsertFactory(query, listaEspecificaciones.map(spec => [spec.idcat_espec, idcomponente, spec.valor]))
    const res = await poolClient.query(query);
    return res.rows;
  },
  update: async (idcomponente,componenteInfo) => {
    const query = {
      name: "actualizar-componente",
      text: "UPDATE componente SET idcategoria=$1, marca=$2, nombre=$3, descripcion=$4, url_imagen=$5 WHERE idcomponente=$6 RETURNING *",
      values: [
        componenteInfo.idcategoria,
        componenteInfo.marca,
        componenteInfo.nombre,
        componenteInfo.descripcion,
        componenteInfo.url_imagen,
        idcomponente
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  updateSpec: async (idcomponente, idcat_espec,valor) => {
    const query = {
      name: "actualizar-especificaciones-componente",
      text: "UPDATE componente_espec SET valor=$1 WHERE idcomponente=$2 AND idcat_espec=$3 RETURNING *",
      values: [
        valor,
        idcomponente,
        idcat_espec
      ]
    }

    const res = await poolClient.query(query);
    return res.rows[0];
  },
  delete: async (idcomponente) => {
    const query = {
      name: "eliminar-componente",
      text: "DELETE FROM componente WHERE idcomponente=$1 RETURNING *",
      values: [idcomponente]
    }

    const res = await poolClient.query(query);

    return res.rows[0];
  }
}