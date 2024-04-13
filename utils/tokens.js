import jwt from "jsonwebtoken";
import { env } from "../environment.js";

//Despues de que ser haya verificado

const tokenSign = async (user) => { //Generar Token
    return jwt.sign(
        user,
        env.JWT_SECRET,
        {
            expiresIn: "2h", //Tiempo de vida
        }
    );
}

const verifyToken = async (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET)
    } catch (e) {
        return null
    }
}

const decodeSign = (token) => { //TODO: Verificar que el token sea valido y correcto
    return jwt.decode(token, null)
}



export const tokens = 
{ 
    tokenSign,  decodeSign, verifyToken 
}