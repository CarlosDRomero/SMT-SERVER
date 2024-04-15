import  axios  from "axios";

const urlBase = "https://www.datos.gov.co/resource/xdk5-pm3f.json";

export const colombiaAPI = {
  obtenerDepartamentos: async () => {
    const res = await axios.get(`${urlBase}/?$select=departamento,c_digo_dane_del_departamento&$group=departamento,c_digo_dane_del_departamento`)
    return res.data
  }
}

