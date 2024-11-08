import { promocionesModel } from "../models/promocion.js"
import { notificacionPayloadFactory } from "../services/notificaciones.js"
import { rolesUsuario } from "./usuario.js"

const crearNotificacionAsignacionCupon = (idusuario, cupon) => {
  return notificacionPayloadFactory({
    tipo: "directa",
    idevento: 6,
    fuente: cupon.idcupon,
    objetivo: idusuario,
    mensaje: `Ha recibido un cupón: ${cupon.asunto}`
  })
}


export const promocionesController = {
  ofertaPageCursorSchema: {
    tiebreaker: { name: "fecha_inicio", direction: 1 },
    id: { name: "idoferta" }
  },
  crearOferta: async (req,res) => {
    
    const oferta = await promocionesModel.createOffer(req.body)

    res.json(oferta)
  },
  actualizarOferta: async (req, res) => {
    const { idoferta } = req.params
    const oferta = await promocionesModel.updateOffer(req.body, idoferta)
    res.json(oferta)
  },
  obtenerOfertasPaginadas: async (req,res,next) => {
    const ofertas = await promocionesModel.pageOffers(req.pageCursor, promocionesController.ofertaPageCursorSchema)
    req.pageData = ofertas

    next()
  },
  obtenerOferta: async (req, res) => {
    const { idoferta } = req.params
    const oferta = await promocionesModel.getOfferById(idoferta)
    res.json(oferta)
  },
  verificarOfertaSobrepuesta: async (req, res, next) => {
    const ofertas = await promocionesModel.getOverlappingOffer(req.body);
    if (ofertas.length) {
      for (const oferta of ofertas){
        if (oferta.idoferta === req.params.idoferta) continue
        let tipoOferta = oferta.idcategoria ? "esta categoria" : "este producto"
        return res.status(409).json({
          message: `Conflicto de oferta: ya existe una oferta para ${tipoOferta} que se superpone. Empieza el ${oferta.fecha_inicio.toLocaleDateString()} y termina el ${oferta.fecha_fin.toLocaleDateString()}`,
          oferta
        });
      }
    }
    next();
  },
  crearCupon: async () => {
    const cupon = promocionesModel.createCoupon()

    res.json(cupon)
  },
  actualizarCupon: async (req, res) => {
    const { idcupon } = req.params
    const cupon = await promocionesModel.updateCoupon(req.body, idcupon)
    res.json(cupon)
  },
  verificarInfoCupon: async () => {
    const cupon = await promocionesModel.getOverlappingCoupon(req.body);
    if (cupon.length) {
      return res.status(409).json({
        message: "Conflicto de cupon: Ya existe un cupon con estas características.",
        oferta: cupon
      });
    }
    next();
  },
  obtenerCupones: async (req, res) => {
    const cupones = promocionesModel.getCoupons()

    res.json(cupones)
  },
  obtenerCuponesUsuario: async (req, res) => {
    const { idusuario } = req.usuario
    const cupones = promocionesModel.getCouponsByUserId(idusuario)

    res.json(cupones)
  },
  asignarCuponUsuario: (conditions) => async (req, _, next) => {
    if (req.usuario && req.usuario.rol === rolesUsuario.CLIENTE){
      
      const { idusuario } = req.usuario
      const cupon = await promocionesModel.findCouponBy(conditions);
      if (!cupon) return next()
      const cuponUsuario = await promocionesModel.checkCouponByUserId(cupon.idcupon, idusuario)
      if (cuponUsuario) return next()
      const asignacion = await promocionesModel.assignCouponToUser(cupon.idcupon, idusuario)
      console.log("Asignacion:", asignacion)
      req.payload = [await crearNotificacionAsignacionCupon(idusuario, cupon)]
    }
    next()
  }
}