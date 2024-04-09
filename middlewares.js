import { validationResult } from "express-validator"
import { Encrypt } from "./utils/encryption.js"

export const checkValidator = (req, res, next) => {
  const errors = validationResult(req);
  console.log(checkValidator)
  if (!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

export const claveEncrypt = async (req, res, next) => {
  req.body.clave = await Encrypt.encryptPassword(req.body.clave);
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

