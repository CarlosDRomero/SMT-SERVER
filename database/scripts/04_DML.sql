COPY atributo_espec(idespec,atributo)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(especificacion).csv'
DELIMITER ','
CSV HEADER;

COPY categoria_producto(idcategoria,denominacion)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(categoria).csv'
DELIMITER ','
CSV HEADER;

COPY producto(idproducto, idcategoria, marca,	nombre, disponibilidad, precio,	descripcion, url_imagen)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(producto).csv'
DELIMITER ','
CSV HEADER;

COPY producto_espec(idespec,idproducto,valor)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(producto_especificacion).csv'
DELIMITER ','
CSV HEADER;

COPY evento_notificacion(idevento,evento)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(evento_notificacion).csv'
DELIMITER ','
CSV HEADER;

COPY tipo_servicio(tipo_servicio,descripcion,url_imagen)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(servicios).csv'
DELIMITER ';'
CSV HEADER;

INSERT INTO tipo_receptor (idtipo, tipo) VALUES
(1,'directo'),
(2,'rol')
;