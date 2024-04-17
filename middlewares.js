import { validationResult } from "express-validator"
import { Encrypt } from "./services/encryption.js"
import { genCode } from "./services/random.js";
import { tokens } from "./services/tokens.js";
import { usuarioModel } from "./models/usuario.js";


export const claveEncrypt = async (req, res, next) => {
  req.body.clave = await Encrypt.toHash(req.body.clave);
  next()
}

export const firmarToken = (req,res, next) => {

  if (!req.usuario) return next();

  const payload = { idusuario: req.usuario.idusuario, nombres: req.usuario.nombres, apellidos: req.usuario.apellidos, email: req.usuario.email }
  const token = tokens.tokenSign(payload);
  return res.json({ token });
}

export const extraerNombreUsuario = (req, res, next) => {
  const email = req.body.email;
  const arroba = email.indexOf("@")
  req.body.nombreUsuario = email.substring(0, arroba)

  next()
}

export const generarCodigo = (req, res, next) => {
  req.payload = { ...req.payload, codigo: genCode() };
  next();
}
//TODO:OPCIONAL > return map de la propiedad del mensaje del error
export const checkValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}


export const errorHandler = (err, req, res, next) => {
  console.log("err code: ", err.code)
  if (err.menssage === "Acceso Denegado"){
    res.status(403);
    res.json({ error: err.message });
  }else if (!!err.code){
    
    console.log(`${err.code}: ${err.message}`)
    res.status(500);
    res.json({ error: "Internal database error" });
  }else{
    next(err)
  }
}

//Middleware para verificar si el usuario esta logeado puede acceder
export const extraerUsuario = async (req, res, next) => {
  const token = req.headers.authorization.split(" ").pop() //El token viene concatenado y esto obtiene el token no mas
  const tokenData = tokens.verifyToken(token) // Al hacer la verificacion se almacena la informacion del mismo en tokenData
  if(tokenData === null || !tokenData.idusuario) return res.status(401).json({ error: "Credenciales no validas" })//no seguro
  const userData = await usuarioModel.findUsuarioById(tokenData.idusuario)
  if (!userData) return res.status(401).json({ error: "Credenciales no validas" })
  
  req.usuario = userData;
  next()
}
//Middleware para verificar a que rol pertenece el logeado
export const verificarRol = (rolesAdmitidos) => {
  return async (req, res, next) => {
    if (!rolesAdmitidos.includes(req.usuario.rol)) return res.status(401).json({ error: "Acceso no permitido" })
    next()
  }
}

