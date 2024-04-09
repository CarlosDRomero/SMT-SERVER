import { usuarioModel } from "../models/usuario.js";
import "express-async-errors";

const registrar = async (req, res) => {
  console.log("registrando")
  const values = [req.body.nombres, 
    req.body.apellidos,
     req.body.clave, 
     req.body.nombreUsuario, 
     req.body.email, 
     req.body.fecha_nac]

    
  const user = await usuarioModel.registrar(values)
  res.json(user)
}


export const usuarioController =  {registrar}