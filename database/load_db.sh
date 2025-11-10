#!/bin/bash
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
SCRIPTS_PATH="${SCRIPT_DIR}/scripts"
CSV_PATH="${SCRIPT_DIR}/scripts/initial_data"

PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -f $SCRIPTS_PATH/01*.sql
PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -f $SCRIPTS_PATH/02*.sql
PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -f $SCRIPTS_PATH/03*.sql

PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -c "\copy atributo_espec(idespec,atributo) FROM $CSV_PATH/especificacion.csv DELIMITER ',' CSV HEADER"
PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -c "\copy categoria_producto(idcategoria,denominacion) FROM $CSV_PATH/categoria.csv DELIMITER ',' CSV HEADER"
PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -c "\copy marca_producto(idmarca,nombre) FROM $CSV_PATH/marca.csv DELIMITER ',' CSV HEADER"
PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -c "\copy producto(idproducto, idcategoria, idmarca, nombre, disponibilidad, precio, descripcion, url_imagen, fecha_salida) FROM $CSV_PATH/producto.csv DELIMITER ',' CSV HEADER"
PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -c "\copy producto_espec(idespec,idproducto,valor) FROM $CSV_PATH/producto_especificacion.csv DELIMITER ',' CSV HEADER"
PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -c "\copy evento_notificacion(idevento,evento) FROM $CSV_PATH/evento_notificacion.csv DELIMITER ',' CSV HEADER"
PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -c "\copy tipo_servicio(tipo_servicio,descripcion,url_imagen) FROM $CSV_PATH/servicios.csv DELIMITER ';' CSV HEADER"
PGPASSWORD=$PGPASSWORD $COMANDO_CONEXION -c "\copy cupon(asunto,descripcion,porcentaje,cantidad,duracion,min_compras,min_gastado) FROM $CSV_PATH/cupon.csv DELIMITER ',' CSV HEADER"
