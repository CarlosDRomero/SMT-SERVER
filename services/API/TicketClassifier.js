import axios from "axios";
import { env } from "../../environment.js";

export const ticketClassifierAPI = {
  clasificarTicket: async (subject, body) => {
    const res = await axios.post(
      `${env.TICKET_CLASSIFIER_URL}/api/classify-ticket`,
      {
        subject, body
      },
      {
        headers: {
          "X-API-key": env.TICKET_CLASSIFIER_API_KEY
        }
      }
    )
    return res.data
  }
}