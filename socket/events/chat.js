import joi from "joi"

const schema = joi.object({
  idconversacion: joi.string().uuid(),
  contenido: joi.string()
})

const chatEvents = {
  onEvents:{
    "enviar-mensaje": (socket, evento) => (mensaje, cb) => {
      const { error, value } = schema.validate(mensaje)
      if (error) return cb(error)

      cb("mensaje enviado")
    }
  }
}

export default chatEvents;