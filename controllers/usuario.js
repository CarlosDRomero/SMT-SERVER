import { usuarioModel } from "../models/usuario.js";
import { calcularExpirado } from "../services/time.js";
import { Encrypt } from "../services/encryption.js";
import { verOnlineIds } from "../socket/utilidades.js";

export const rolesUsuario = {
  ADMIN: "admin",
  EMPLEADO: "empleado",
  CLIENTE: "cliente"
}
rolesUsuario.ADMINISTRADOR = rolesUsuario.ADMIN

export const usuarioController = {
  
  encontrarUsuarioCodigo: async (req, res, next) => {
    const idcodigo = req.params.id;
    const usuario = await usuarioModel.findByIdCodigo(idcodigo);
    if (!usuario) return res.status(404).json({ error: "Error, no se pudo encontrar su id de verificación" });
    req.payload = { idusuario: usuario.idusuario, email: usuario.email }
    next()
  },
  registrar: async (req, res, next) => {

    const existingUser = await usuarioModel.findByEmailOrUserName(req.body)
    if (!!existingUser){
      if (!!existingUser.fecha_confirmado || existingUser.rol !== rolesUsuario.CLIENTE)
        return res.status(409).json({ error: "Correo en uso" })

      await usuarioModel.limpiarUsuario(existingUser.idusuario)
    }
    const usuario = await usuarioModel.registrar(req.body);
  
    req.payload  = {
      idusuario: usuario.idusuario,
      email: usuario.email
    };
    next()
  
  },
  actualizarRol: async (req, res, next) => {
    const nuevoRol = req.params.rol.toUpperCase();
    await usuarioModel.actualizarRol(rolesUsuario[nuevoRol], req.payload.idusuario)
    next()
  },
  login: async(req, res, next) => {
    const usuario = await usuarioModel.findByEmailOrUserName(req.body)
    if (!usuario || !await Encrypt.compareHash(req.body.clave, usuario.clave)){
      return res.status(401).json({ error: "Credenciales invalidas" })
    }
    if (usuario.fecha_confirmado === null || calcularExpirado(usuario.fecha_confirmado, 5, "m")) {
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
  },
  obtenerRol: (req, res) => {
    const { rol } = req.usuario
    res.json({ rol })
  },
  obtenerOnline: async (req, res) => {
    const socketOnline = verOnlineIds()
    const usuariosOnline = await Promise.all(socketOnline.map(
      async id => {
        const { idusuario, nombres, apellidos, email, nombre_usuario } = await usuarioModel.findById(id)
        return { idusuario, nombres, apellidos, email, nombre_usuario }
      }
    ));
    console.log("USUARIOS ONLINE: ", usuariosOnline)
    res.json(usuariosOnline)
  },
  validarEmailCliente: async (req, res, next) => {
    const { email } = req.body
    const usuario = await usuarioModel.findByEmailOrUserName(email)
    if (!usuario)return next()
    next({ name: "RolNoDebido", message: "Inicia sesion para crear un ticket" })

  }
}

