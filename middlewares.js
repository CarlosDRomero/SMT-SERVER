import { validationResult } from "express-validator"
import { Encrypt } from "./utils/encryption.js"

export const checkValidator = (req, res, next) => {
  console.log("Checkeando")
  const errors = validationResult(req);
  console.log(checkValidator)
  if (!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }
  next()
}

export const claveEncrypt = async (req, res, next) => {
  console.log("Encriptando")
  req.body.clave = await Encrypt.encryptPassword(req.body.clave);
  next()
}

export const errorHandler = (err, req, res, next) => {
  if (err.menssage === 'Acceso Denegado'){
    res.status(403);
    res.json({error: err.message});
  }else if (!!err.table && err.name==="error"){
    res.status(502);
    res.json({error: err.message});
  }
  next(err);
}

