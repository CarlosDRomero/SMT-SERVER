import  axios  from "axios";

const urlBase = "https://www.datos.gov.co/resource/xdk5-pm3f.json";

export const colombiaAPI = {
  obtenerDepartamentos: async () => {
    const res = await axios.get(`${urlBase}/?$select=departamento,c_digo_dane_del_departamento&$group=departamento,c_digo_dane_del_departamento&$order=c_digo_dane_del_departamento`)
    return res.data
  },

  obtenerMunicipios: async (c_departamento) => {
    const res = await axios.get(`${urlBase}/?$select=municipio,c_digo_dane_del_municipio&$order=c_digo_dane_del_municipio&$where=c_digo_dane_del_departamento=${c_departamento}`)
    return res.data
  },


  obtenerDepartamentoMunicipio: async (c_municipio) => {
    const res = await axios.get(`${urlBase}/?$select=departamento,municipio&$group=municipio,departamento&$where=c_digo_dane_del_municipio=${c_municipio}`)
    return res.data
  }
}

