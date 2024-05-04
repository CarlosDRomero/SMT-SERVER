import moment from "moment-timezone"

/**
* @param fecha Es la fecha que queremos comprobar si ha expirado
* @param tiempo Es el valor numerico que queremos saber si ha pasado desde la fecha del primer argumento (si no se pasa nada toma el valor 1)
* @param unidad Es la unidad del tiempo que queremos saber que ha pasado esta va de la siguiente manera:
* years: "y",
* quarters: "Q",
* months: "M",
* weeks: "w",
* days: "d",
* hours: "h",
* minutes: "m" (este es el valor por defecto),
* seconds: "s",
* milliseconds: "ms"
* xDDDD
*/

export const calcularExpirado = (fecha, tiempo = 1, unidad = "m") => {
  const fecha_calculada = moment(fecha).add(tiempo, unidad)
  return moment().isAfter(fecha_calculada)
}