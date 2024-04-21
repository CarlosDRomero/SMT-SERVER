import { domicilioModel } from "../models/domicilio.js";

export const domicilioController = {

  crearDireccion: async(req, res) => {
    const idusuario = req.usuario.idusuario
    const ubicacion = await domicilioModel.insertAddressUser({ idusuario, ...req.body });
    return res.status(201).json(ubicacion)
  },
  obtenerDireccion: async(req, res) => {
    const idusuario = req.usuario.idusuario
    const direcciones = await domicilioModel.getAddressUser(idusuario);
    res.json(direcciones);
  },
  actualizarDireccion: async(req, res) => {
    const idusuario = req.usuario.idusuario
    const iddireccion = req.params.iddireccion
    const ubicacion = await domicilioModel.updateAddressUser(idusuario, req.body, iddireccion);
    if(!ubicacion) return res.status(403).json({ error: "No tiene permisos para esta accion" })
    return res.status(201).json(ubicacion)
  },
  eliminarDireccion: async(req, res) => {
    const idusuario = req.usuario.idusuario
    const iddireccion = req.params.iddireccion
    const resultado = await domicilioModel.deleteAddressUser(iddireccion, idusuario);
    if(!resultado) return res.status(403).json({ error: "No tiene permisos para esta accion" });
    return res.status(204).json();
  }
    
}