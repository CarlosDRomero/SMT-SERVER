import { rolesUsuario } from "../../controllers/usuario.js"

export const fecha_validator = (dateString) => {
  if(!/^([0-9]{2})?[0-9]{2}(\/|-)(1[0-2]|0?[1-9])\2(3[01]|[12][0-9]|0?[1-9])$/.test(dateString))
    return false;

  let parts = dateString.split(/[\/|-]/);
  let day = parseInt(parts[2], 10);
  let month = parseInt(parts[1], 10);
  let year = parseInt(parts[0], 10);

  if(year < 1000 || year > 3000 || month === 0 || month > 12)
    return false;

  let monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

  if(year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
    monthLength[1] = 29;

  return day > 0 && day <= monthLength[month - 1];
};

export const RolValidator = (rol) => {
  // console.log("VALIDANDO ROL: ", rol,!!usuarioController.roles[rol.toUpperCase()])
  return !!rolesUsuario[rol.toUpperCase()]
}