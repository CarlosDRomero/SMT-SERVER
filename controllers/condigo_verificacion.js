import { codigoModel } from "../models/codigo_verificacion.js"
import { Encrypt } from "../utils/encryption.js"
import { calcularExpirado } from "../utils/time.js"

const recrearCodigo = async (req, res) => {
  const { idcodigo, codigo } = req.payload
  const nuevo_codigo = await Encrypt.toHash(codigo)
  const codigo_verificacion = await codigoModel.actualizarCodigoById(idcodigo, nuevo_codigo)
  
  res.json({ token: codigo_verificacion.idcodigo })
}

const crearCodigo = async (req, res) => {
  const { idusuario, codigo } = req.payload
  const nuevo_codigo = await Encrypt.toHash(codigo)
  const codigo_db = await codigoModel.findCodigoUsuario(idusuario)
  let codigo_verificacion;
  if (!codigo_db)
    codigo_verificacion = await codigoModel.crearCodigo(idusuario, nuevo_codigo)
  else
    codigo_verificacion = await codigoModel.actualizarCodigoById(idusuario, nuevo_codigo)
  res.status(403).json({ token: codigo_verificacion.idcodigo })
}

const validarCodigo = async (req,res,next) => {
  const { codigo, id } = req.body
  const codigo_verificacion = await codigoModel.findCodigoById(id);
  if (!!codigo_verificacion
    && await Encrypt.compareHash(codigo, codigo_verificacion.codigo)
    && !calcularExpirado(codigo_verificacion.fecha_creacion, 1, "m") //ESTO SIGNIFICA QUE NO HAYA PASADO UN MINUTO
  ){
    
    req.body.idusuario = codigo_verificacion.idusuario;
    return next()
  }
  res.status(401).json({ error: "El codigo no es correcto o ya expiro" })
}

export const codigoController = {
  crearCodigo, recrearCodigo, validarCodigo
}