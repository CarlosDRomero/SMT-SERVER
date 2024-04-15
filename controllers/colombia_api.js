import { colombiaAPI } from "../services/API/Colombia.js";

export const colombiaAPIController = { 
  obtenerDepartamentos: async(req, res) => {
    const departamentos = await colombiaAPI.obtenerDepartamentos()
    res.json(departamentos)
  }
}