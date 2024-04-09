import {body, validationResult} from "express-validator";

const isValidDate =(dateString) =>{
    // First check for the pattern
    if(!/^([0-9]{2})?[0-9]{2}(\/|-)(1[0-2]|0?[1-9])\2(3[01]|[12][0-9]|0?[1-9])$/.test(dateString))
        return false;

    
    // Parse the date parts to integers
    let parts = dateString.split(/[\/|-]/);
    console.log(parts)
    let day = parseInt(parts[2], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[0], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    let monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

const usuarioValidator = () => {
    return [
      body("nombres", "Nombres no validos").notEmpty(),
      body("apellidos", "Apellidos no validos").notEmpty(),
      body("nombreUsuario", "Nombres Usuario no valido").notEmpty(),
      body("clave", "Clave no valida").notEmpty(),
      body("email", "Email no valido").isEmail(),
      body("fecha_nac", "Fecha Nacimiento no valida").custom(isValidDate),
    ]
  }


const checkValidator = (req, res, next) => {
  const errors = validationResult(req);
  console.log(checkValidator)
  if (!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }
  next()
}