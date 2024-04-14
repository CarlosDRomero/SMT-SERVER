import { usuarioModel } from "../models/usuario.js";
import { calcularExpirado } from "../services/time.js";
import { Encrypt } from "../services/encryption.js";

export const usuarioController = {
  encontrarUsuarioCodigo: async (req, res, next) => {
    const usuario = await usuarioModel.findUsuarioByIdCodigo(req.id);
    if (!usuario) return res.status(404).json({ error: "Error, no se pudo encontrar su id de verificación" });
    req.payload = { idusuario: usuario.idusuario, email: usuario.email }
    next()
  },
  registrar: async (req, res, next) => {

    const existingUser = await usuarioModel.findUsuario(req.body)
    if (!!existingUser){
      if (!!existingUser.fecha_confirmado) {
        return res.status(409).json({ error: "Correo en uso" })
      }
      await usuarioModel.limpiarUsuario(existingUser.idusuario)

    }
    const usuario = await usuarioModel.registrar(req.body);
  
    req.payload  = {
      idusuario: usuario.idusuario,
      email: usuario.email
    };
    next()
  
  },
  login: async(req, res, next) => {
    const usuario = await usuarioModel.findUsuario(req.body)
    if (!usuario || !await Encrypt.compareHash(req.body.clave, usuario.clave)){
      return res.status(401).json({ error: "Credenciales invalidas" })
    }

    if (usuario.fecha_confirmado === null || calcularExpirado(usuario.fecha_confirmado, 1, "m")) {
      req.payload = { idusuario: usuario.idusuario, email: usuario.email }

      return next()
    }
    req.usuario = usuario;
    next();
  
  },
  confirmar: async (req, res, next) => {
    const confirmado = await usuarioModel.confirmar(req.idusuario)
    console.log(confirmado)
    req.usuario = confirmado
    next()
  }

}

