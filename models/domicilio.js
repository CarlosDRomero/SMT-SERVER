import { poolClient } from "../database/conexion.js"

export const domicilioModel = {

    insertAddressUser: async( addressInfo ) => {
        const query = {
        name: "guardar-direccion",
        text: "INSERT INTO direccion (idusuario, c_dane_departamento, c_dane_municipio, barrio, cadena_direccion) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        values: [
            addressInfo.idusuario,
            addressInfo.c_dane_departamento,
            addressInfo.c_dane_municipio,
            addressInfo.barrio,
            addressInfo.cadena_direccion
        ]
        }
    const result = await poolClient.query(query);
    return result.rows[0] 
    },

    getAddressUser: async (idusuario) => {
        const query = {
            name: "obtener-componentes-inventario",
            text: "SELECT * FROM direccion where idusuario=$1",
            values: [idusuario]
            }
         const res = await poolClient.query(query);
        return res.rows;
            }

    }
    

