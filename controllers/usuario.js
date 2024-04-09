import { usuarioModel } from "../models/usuario.js";

const registrar = async (req, res) => {

  const existingUser = await usuarioModel.getUsuario(req.body)

  const user = await usuarioModel.registrar(req.body);
  const codigo_verificacion = await usuarioModel.nuevoCodigo(user)
  
  res.json(codigo_verificacion)
}


export const usuarioController =  { registrar }