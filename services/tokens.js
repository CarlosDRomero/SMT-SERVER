import jwt from "jsonwebtoken";
import { env } from "../environment.js";

//Despues de que ser haya verificado
export const tokens = {

  tokenSign: (user) => { //Generar Token
    return jwt.sign(
      user,
      env.JWT_SECRET
    );
  },
  
  verifyToken: (token) => {
    return jwt.verify(token, env.JWT_SECRET)
  },
  
  decodeSign: (token) => {
    return jwt.decode(token, null)
  }
}