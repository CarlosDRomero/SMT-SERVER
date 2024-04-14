import { env } from "../environment.js";
import { mailerService } from "../services/mailer.js"
import { emailTemplates } from "../templates/email_templates.js";


export const mailerController = {
  mailVerificacion: async (req, res, next) => {
    !env.IS_TEST && mailerService.enviarCorreo({
      to: req.payload.email,
      subject: "Verificacion Support Max TI",
      html: emailTemplates.correoVerificacion(req.payload.codigo)
    })
    next();
  }
}
