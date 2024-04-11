import { validationResult } from "express-validator"
import { Encrypt } from "./utils/encryption.js"
import isUUID from "uuid-validate"

export const claveEncrypt = async (req, res, next) => {
  req.body.clave = await Encrypt.toHash(req.body.clave);
  next()
}

export const extraerNombreUsuario = (req, res, next) => {
  const email = req.body.email;
  const arroba = email.indexOf("@")
  req.body.nombreUsuario = email.substring(0, arroba)

  next()
}

export const validarUUID = (req, res, next) => {
  const id = req.params.id
  if (!isUUID(id)) res.status().json({ error: "Token no valido" })
  req.body.id = id;
  next()
}


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

