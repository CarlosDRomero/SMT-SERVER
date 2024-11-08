COPY atributo_espec(idespec,atributo)
FROM '/docker-entrypoint-initdb.d/initial_data/especificacion.csv'
DELIMITER ','
CSV HEADER;

COPY categoria_producto(idcategoria,denominacion)
FROM '/docker-entrypoint-initdb.d/initial_data/categoria.csv'
DELIMITER ','
CSV HEADER;

COPY marca_producto(idmarca,nombre)
FROM '/docker-entrypoint-initdb.d/initial_data/marca.csv'
DELIMITER ','
CSV HEADER;

COPY producto(idproducto, idcategoria, idmarca,	nombre, disponibilidad, precio,	descripcion, url_imagen, fecha_salida)
FROM '/docker-entrypoint-initdb.d/initial_data/producto.csv'
DELIMITER ','
CSV HEADER;

COPY producto_espec(idespec,idproducto,valor)
FROM '/docker-entrypoint-initdb.d/initial_data/producto_especificacion.csv'
DELIMITER ','
CSV HEADER;

COPY evento_notificacion(idevento,evento)
FROM '/docker-entrypoint-initdb.d/initial_data/evento_notificacion.csv'
DELIMITER ','
CSV HEADER;

COPY tipo_servicio(tipo_servicio,descripcion,url_imagen)
FROM '/docker-entrypoint-initdb.d/initial_data/servicios.csv'
DELIMITER ';'
CSV HEADER;
COPY cupon(asunto,descripcion,porcentaje,cantidad,duracion,min_compras,min_gastado)
FROM '/docker-entrypoint-initdb.d/initial_data/cupon.csv'
DELIMITER ','
CSV HEADER;

INSERT INTO tipo_receptor (idtipo, tipo) VALUES
(1,'directo'),
(2,'rol')
;