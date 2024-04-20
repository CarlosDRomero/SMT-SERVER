import { codigoModel } from "../models/codigo_verificacion.js"
import { Encrypt } from "../services/encryption.js"
import { calcularExpirado } from "../services/time.js"

export const codigoController = {
  crearCodigo: async (req, res) => {
    const { idusuario, codigo } = req.payload
    const nuevo_codigo = await Encrypt.toHash(codigo)
    const codigo_db = await codigoModel.findCodigoUsuario(idusuario)
    let codigo_verificacion;
  
    if (!codigo_db)
      codigo_verificacion = await codigoModel.crearCodigo(idusuario, nuevo_codigo)
    else
      codigo_verificacion = await codigoModel.actualizarCodigoUsuario(idusuario, nuevo_codigo)
    res.json({ verificationId: codigo_verificacion.idcodigo })
  },
  validarCodigo: async (req,res,next) => {
    const idcodigo = req.params.id
    const { codigo } = req.body
    const codigo_db = await codigoModel.findById(idcodigo);
    console.log(codigo_db)
    if (!!codigo_db
    && await Encrypt.compareHash(codigo.toUpperCase(), codigo_db.codigo)
    && !calcularExpirado(codigo_db.fecha_creacion, 1, "m") //ESTO SIGNIFICA QUE NO HAYA PASADO UN MINUTO
    ){
    
      req.idusuario = codigo_db.idusuario;
      return next()
    }
    res.status(401).json({ error: "El codigo no es correcto o ya expiro" })
  }
}


