import { Router } from "express"
import { usuarioController } from "../controllers/usuario.js"
import { usuarioValidator } from "../validators/usuario_validator.js";
import { checkValidator, claveEncrypt } from "../middlewares.js";

const usuarioRouter = Router()

usuarioRouter.post("/cliente",
 usuarioValidator(),
 checkValidator, 
 claveEncrypt,
 usuarioController.registrar);

export default usuarioRouter;