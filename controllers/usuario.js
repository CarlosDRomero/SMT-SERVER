import { usuarioModel } from "../models/usuario.js";
import { genCode } from "../utils/random.js";
import { enviarCorreo } from "../utils/mailer.js";

const confirmar = async (req, res, next) => {
  const { idusuario } = req.body
  const confirmado = await usuarioModel.confirmar(idusuario)

  res.json({ token: "andrey XD, aqui querriamos generar un JWT yo creo" })
}
const registrar = async (req, res, next) => {

  const existingUser = await usuarioModel.findUsuario(req.body)
  if (!!existingUser){
    if (!!existingUser.fecha_confirmado) {
      return res.status(409).json({ error: "Correo en uso" })
    }
    await usuarioModel.limpiarUsuario(existingUser.idusuario)

  }
  const user = await usuarioModel.registrar(req.body);
  const payload = {
    idusuario: user.idusuario,
    codigo: genCode()
  };
  enviarCorreo(user.email, payload.codigo)
  req.payload = payload
  next()
  
}



export const usuarioController =  { registrar,confirmar }