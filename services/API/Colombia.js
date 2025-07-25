import  axios  from "axios";
import fs from "fs";
// WARNING: API CAIDA
const urlBase = "https://www.datos.gov.co/resource/xdk5-pm3f.json";
// Datos temporales sin api
let colombia
await fs.readFile("./database/colombia.json", { encoding:"utf-8" }, function(err, data) {

  if (err) throw err;
  colombia = JSON.parse(data);

});
export const colombiaAPI = {
  obtenerDepartamentos: async () => {
    // const res = await axios.get(`${urlBase}/?$select=departamento,c_digo_dane_del_departamento&$group=departamento,c_digo_dane_del_departamento&$order=c_digo_dane_del_departamento`)
    // return res.data
    return colombia.map(c => ({ departamento: c.departamento, c_digo_dane_del_departamento: `${c.id}` }))

  },

  obtenerMunicipios: async (c_departamento) => {
    // const res = await axios.get(`${urlBase}/?$select=municipio,c_digo_dane_del_municipio&$order=c_digo_dane_del_municipio&$where=c_digo_dane_del_departamento=${c_departamento}`)
    // return res.data
    const registro = colombia.find(v => v.id === Number(c_departamento))
    return registro.ciudades.map((v, i) => ({ municipio: v, c_digo_dane_del_municipio: `${c_departamento}-${i}` }))
  },


  obtenerDepartamentoMunicipio: async (c_municipio) => {
    // const res = await axios.get(`${urlBase}/?$select=departamento,municipio&$group=municipio,departamento&$where=c_digo_dane_del_municipio=${c_municipio}`)
    // return res.data
    const [id_departamento, id_municipio] = c_municipio.split("-")
    const registro = colombia.find(v => v.id === Number(id_departamento))
    return { departamento: registro.departamento, municipio: registro.ciudades[Number(id_municipio)] }
  }
}

