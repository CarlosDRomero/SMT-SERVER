import { usuarioModel } from "../models/usuario.js";
import { genCode } from "../utils/random.js";
import { enviarCorreo } from "../utils/mailer.js";
import { calcularExpirado } from "../utils/time.js";
import { tokens } from "../utils/tokens.js";
import { Encrypt } from "../utils/encryption.js";

const confirmar = async (req, res, next) => {
  const { idusuario } = req.body
  const confirmado = await usuarioModel.confirmar(idusuario)

  const payload = {idusuario, rol: confirmado.rol};
  
  const token = tokens.tokenSign(payload);

  res.json({ token });
}

const login = async(req, res, next) => {
  const existingUser = await usuarioModel.findUsuario(req.body)
  if (!existingUser || !await Encrypt.compareHash(req.body.clave, existingUser.clave)){
    return res.status(401).json({error: "Credenciales invalidas"})
  }

  if (existingUser.fecha_confirmado === null || calcularExpirado(existingUser.fecha_confirmado, 1, "m")) {
    req.payload = {idusuario: existingUser.idusuario, codigo: genCode()}
    return next()
  }  
  
  const payload = {
    idusuario: existingUser.idusuario,
    rol: existingUser.rol
  }
  const token = tokens.tokenSign(payload);
  return res.json({ token });
  
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



export const usuarioController =  { registrar,confirmar, login }