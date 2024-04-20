import { domicilioModel } from "../models/domicilio.js";

export const domicilioController = {

    crearDireccion: async(req, res, next) => {
      const idusuario = req.usuario.idusuario
      console.log(idusuario)
        const ubicacion = await domicilioModel.insertAddressUser(req.body);
        req.payload  = {
          idusuario: ubicacion.idusuario
        };
        
    
    return res.status(201).json({ msg: "Created" })
    //next()
    },
    obtenerDireccionesUsuario: async(req, res) => {
      const direcciones = await domicilioModel.getAddressUser();
      res.json(direcciones);
    }
    
}