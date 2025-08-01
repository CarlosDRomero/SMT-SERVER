import { matchedData, validationResult } from "express-validator"
import { Encrypt } from "./services/encryption.js"
import { genCode } from "./services/random.js";
import { tokens } from "./services/tokens.js";
import { usuarioModel } from "./models/usuario.js";
import { encodeCursor, filterValidCursorOrderingFields, setCursorLast } from "./utils.js";
import { cursorRequestValidator } from "./validators/cursor_validator.js"

export const claveEncrypt = async (req, _, next) => {
  req.body.clave = await Encrypt.toHash(req.body.clave);
  next()
}

export const firmarToken = (req,res, next) => {

  if (!req.usuario) return next();
  console.log("Logged in")
  const payload = { idusuario: req.usuario.idusuario, nombres: req.usuario.nombres, apellidos: req.usuario.apellidos, email: req.usuario.email, nombreUsuario: req.usuario.nombre_usuario }
  const token = tokens.tokenSign(payload);
  return res.json({ token });
}

export const extraerNombreUsuario = (req, res, next) => {
  const email = req.body.email;
  const arroba = email.indexOf("@")
  req.body.nombreUsuario = email.substring(0, arroba)

  next()
}

export const generarCodigo = (req, _, next) => {
  req.payloadc = { ...req.payloadc, codigo: genCode() };
  console.log("CODIGO: ",req.payloadc.codigo)
  next();
}
//TODO:OPCIONAL > return map de la propiedad del mensaje del error
export const checkValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    console.log("ERRORES: ", errors.array())
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}
export const checkNoExtraFields = (req, res, next) => {
  const matches = matchedData(req);
  if (Object.keys(matches).length !== Object.keys(req.body).length + Object.keys(req.params).length){
    return res.status(400).json({ error: "Parece que has intentado enviar algunos campos no deseados" })
  }
  next()
}

export const errorHandler = (err, _, res, next) => {
  console.log("err code: ", err)
  if (res.finished) return;
  if (err.name === "JsonWebTokenError"){
    return res.status(401).json({ error: err.message });
  }else if (err.name === "RolNoPermitido" || err.name === "RolNoDebido"){
    return res.status(403).json({ error: err.message })
  }else if (err.name === "RecursoNoEncontrado"){
    return res.status(404).json({ error: err.message })
  }else{
    // console.log(`${err.code}: ${err.message}`)
    res.status(500).json({ error: "Internal server error" });
  }
  next(err)
}

//Middleware para verificar si el usuario esta logeado puede acceder
export const extraerUsuario = async (req, _, next) => {
  const token = req.headers.authorization?.split(" ").pop() //El token viene concatenado y esto obtiene el token no mas
  const tokenData = tokens.verifyToken(token) // Al hacer la verificacion se almacena la informacion del token decodificado en tokenData
  
  const userData = await usuarioModel.findById(tokenData?.idusuario)
  if (!tokenData || !userData) return next({ name: "JsonWebTokenError", message: "El token no es valido" })
  req.usuario = userData;
  next()
}
//Middleware para verificar a que rol pertenece el logeado


export const verificarRol = (rolesAdmitidos) => {
  return async (req, _, next) => {
    if (!rolesAdmitidos.includes(req.usuario.rol)) return next({ name: "RolNoPermitido", message: "Acceso no permitido" })
    
    next()
  }
}
export const middlewarePorRol = (rolesGestionadores, vista1, vista2) => (req, res,next) => {
  if (rolesGestionadores.includes(req.usuario.rol)) return vista1(req, res,next)
  return vista2(req, res,next)
}

/**
*
* Esta funcion exige primero que nada que las rutas que la usen reciban un parametro llamado "idusuario",
* con dicho parametro la funcion buscara al usuario en la base de datos y entonces
* remplazará al req.usuario originario de la peticion por dicho usuario, para lograr gestionar datos sobre
* este.
*
**/

export const gestionarUsuario = (rolObjetivo, rolesGestionantes) => async (req, res, next) => {
  if (req.usuario && req.params.idusuario !== req.usuario.idusuario && rolesGestionantes.includes(req.usuario.rol)){
    const userData = await usuarioModel.findById(req.headers.idusuario_gestionado)
    if (!userData) return res.status(404).json({ error: "Debes gestionar a un usuario que exista." })
    if (userData.rol !== rolObjetivo) return next({ name: "RolNoDebido", message: "Este usuario no aplica para esta caracteristica" })
    req.usuarioGestor = req.usuario;
    req.usuario = userData;
  }
  next()
}

export const parsePaginationHeader = (req, _, next) => {
  if (req.headers.pagination)
    req.headers.pagination = JSON.parse(req.headers.pagination)
  next()
}
export const parsePagination = (validOrderingFields = []) => (req, res, next) => {
  if (req.headers.pagination){
    const { cursor, cursorsetup } = req.headers.pagination
    if (cursorsetup){
      req.pageCursor = {
        fields: filterValidCursorOrderingFields(cursorsetup.orderby, validOrderingFields),
        pageSize: cursorsetup.pagesize
      }
      return next()
    }
    else if (cursor){
      const decoded_cursor = JSON.parse(atob(cursor))
      req.pageCursor = decoded_cursor
      return next()
    }
  }
  req.pageCursor = {}
  next()
}

export const sendPaginationResponse = (pageCursorSchema) => (req, res) => {
  let nextPageCursor = null
  if (req.pageData.length){
    setCursorLast(req.pageData[req.pageData.length - 1], req.pageCursor, pageCursorSchema)
    nextPageCursor = encodeCursor(req.pageCursor)
  }

  res.json({ nextPageCursor, data: req.pageData });
}

/**
 * Una función para aplicar el algoritmo de paginación sobre las rutas que get que se quiera
**/
export const withPagination = (validOrderParams, cursorSchema, paginationData) => ([
  parsePaginationHeader,
  cursorRequestValidator,
  checkValidator,
  parsePagination(validOrderParams),
  paginationData,
  sendPaginationResponse(cursorSchema)
])



