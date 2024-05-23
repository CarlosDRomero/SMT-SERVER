import { colombiaAPI } from "../services/API/Colombia.js";

export const colombiaAPIController = {
  obtenerDepartamentos: async(req, res) => {
    const departamentos = await colombiaAPI.obtenerDepartamentos()
    res.json(departamentos)
  },

  obtenerMunicipiosPorDep: async(req, res) => {
    const c_departamento = req.params.c_departamento
    const municipios = await colombiaAPI.obtenerMunicipios(c_departamento)
    res.json(municipios)
  },
  obtenerDepartamentoMunicipio: async(req, res) => {
    const { c_municipio } = req.params
    const [info] = await colombiaAPI.obtenerDepartamentoMunicipio(c_municipio)
    res.json(info)
  }

}