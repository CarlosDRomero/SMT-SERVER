import { domicilioModel } from "../models/domicilio.js";

export const domicilioController = {

    crearDireccion: async(req, res, next) => {
        const ubicacion = await domicilioModel.guardarDireccion(req.body);
    req.payload  = {
      idusuario: ubicacion.idusuario,
      c_dane_departamento: ubicacion.c_dane_departamento,
      c_dane_municipio: ubicacion.c_dane_municipio,
      barrio: ubicacion.barrio,
      cadena_direccion: ubicacion.cadena_direccion
    };
    return res.status(201).json({ msg: "Created" })
    //next()
    }
}