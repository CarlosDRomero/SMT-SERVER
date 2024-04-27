COPY atributo_espec(idespec, atributo)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(especificacion).csv'
DELIMITER ','
CSV HEADER;

COPY categoria_componente(idcategoria, denominacion)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(categoria).csv'
DELIMITER ','
CSV HEADER;

COPY categoria_espec(idcat_espec, idcategoria, idespec)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(categoria_especificacion).csv'
DELIMITER ','
CSV HEADER;

COPY componente(idcomponente, idcategoria, marca,	nombre,	descripcion, url_imagen)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(componente).csv'
DELIMITER ','
CSV HEADER;

COPY inventario(idcomponente,	SKU,	disponibilidad,	precio)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(inventario).csv'
DELIMITER ','
CSV HEADER;

COPY componente_espec(idcat_espec,idcomponente,valor)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(componente_especificacion).csv'
DELIMITER ','
CSV HEADER;

COPY evento_notificacion(idevento,evento)
FROM '/docker-entrypoint-initdb.d/initial_data/DBCC(evento_notificacion).csv'
DELIMITER ','
CSV HEADER;

INSERT INTO tipo_receptor (idtipo, tipo) VALUES
(1,'directo'),
(2,'rol')
;