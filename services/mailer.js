import nodemailer from "nodemailer"
import { env } from "../environment.js"

const transporter = () => nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  // secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: env.EMAIL_ADDRESS,
    pass: env.EMAIL_PASSWORD
  },
});

export const mailerService = {
  enviarCorreo: async (message) => {
    transporter().sendMail(message)
      .then(res => console.log(res.accepted))
      .catch(e => console.log(e));
    
    

  }
}
