/*
 * 
 * esta funcion sirve para comprobar que una direccion dentro de la tabla de direcciones es la primera
 * que pertenece a su usuario
 * 
 * */



CREATE OR REPLACE FUNCTION es_primer_direccion(idusuario_creada UUID)
RETURNS BOOLEAN AS $$
DECLARE
    es_primera BOOLEAN;
BEGIN
    SELECT COUNT(*) = 0 INTO es_primera
    FROM direccion
    WHERE idusuario = idusuario_creada AND predeterminada=TRUE;

    RETURN es_primera;
END;
$$ LANGUAGE plpgsql;

/*
 * 
 * TODO:IMPORTANTE > FUNCION o FUNCIONES PARA RECUPERAR LAS NOTIFICACIONES DE UN USUARIO
 * 
 * */
CREATE TYPE data_notificacion AS (
	idnotificacion UUID,
  idevento INTEGER,
  idtipo INTEGER,
  idusuario_iniciador UUID,
  idusuario_notificado UUID,
  roles_notificados rolesUsuario[],
  idfuente UUID,
  mensaje VARCHAR(500),
  fecha_creacion TIMESTAMP WITH TIME ZONE,
  visto BOOLEAN   
 );


CREATE OR REPLACE FUNCTION obtener_notificaciones_usuario(idusuario_peticion UUID)
RETURNS SETOF data_notificacion
AS $$
DECLARE
	rol_usuario rolesUsuario;
BEGIN
	
		SELECT rol INTO rol_usuario FROM usuario WHERE idusuario=idusuario_peticion;
    RETURN QUERY
    SELECT n.*, 
        CASE 
            WHEN v.idusuario IS NOT NULL THEN TRUE 
            ELSE FALSE 
        END AS visto
    FROM notificacion n
    LEFT JOIN (
        SELECT *
        FROM vistas_notificacion vn
        WHERE vn.idusuario = idusuario_peticion
    ) v ON n.idnotificacion = v.idnotificacion
    WHERE n.idusuario_notificado = idusuario_peticion OR rol_usuario = ANY(n.roles_notificados)
   ORDER BY n.fecha_creacion DESC;
END;
$$ LANGUAGE plpgsql;

/*
 * 
 * FUNCION QUE PERMITIRA HACER QUE UNA NOTIFICACION SEA 'VISTA' POR UN USUARIO
 * 
 */

CREATE OR REPLACE FUNCTION marcar_notificacion_vista(idusuario_peticion UUID, idnotificacion_vista UUID) 
RETURNS SETOF data_notificacion
AS $$
#variable_conflict use_column
DECLARE
	fila_notif data_notificacion;
BEGIN
	SELECT * INTO STRICT fila_notif FROM obtener_notificaciones_usuario(idusuario_peticion) 
 	WHERE idnotificacion=idnotificacion_vista;
 
  INSERT INTO vistas_notificacion (idnotificacion, idusuario) VALUES (idnotificacion_vista, idusuario_peticion);
 	fila_notif.visto := TRUE;
	RETURN NEXT fila_notif;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reabrir_ticket(id UUID)
RETURNS SETOF ticket AS
$$
DECLARE
	estadoAnterior estadosTicket;
	estadoActual estadosTicket;
BEGIN
	SELECT estado INTO estadoActual FROM ticket t WHERE t.idticket=id;
	IF estadoActual='cerrado' THEN
		SELECT estado INTO estadoAnterior FROM ultimo_estado_ticket u WHERE u.idticket=id;
        DELETE FROM ultimo_estado_ticket WHERE idticket=id;
				DELETE FROM calificacion_ticket WHERE idticket=id;
		RETURN QUERY UPDATE ticket t SET estado=estadoAnterior WHERE t.idticket=id RETURNING *;
	END IF;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION obtener_carrito(id_usuario UUID)
RETURNS UUID AS 
$$
DECLARE
	id_carrito UUID;
BEGIN 
	SELECT idcarrito INTO id_carrito FROM carrito_compras WHERE idusuario=id_usuario;
	IF (id_carrito IS NULL) THEN
		INSERT INTO carrito_compras(idusuario) VALUES (id_usuario) RETURNING idcarrito INTO id_carrito;
		
	END IF;
	RETURN id_carrito;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION agregar_a_carrito(id_usuario UUID, id_producto UUID, cantidad_agregada integer)
RETURNS SETOF producto_carrito AS
$$
DECLARE
	id_carrito UUID;
	cantidad_actual integer;
BEGIN
	id_carrito :=	obtener_carrito(id_usuario);
	SELECT cantidad INTO cantidad_actual FROM producto_carrito WHERE idcarrito=id_carrito AND idproducto=id_producto;
IF (cantidad_actual IS NULL) THEN
	INSERT INTO producto_carrito(idcarrito, idproducto, cantidad) VALUES (id_carrito, id_producto, cantidad_agregada);
ELSE
	UPDATE producto_carrito SET cantidad=cantidad_actual+cantidad_agregada WHERE idcarrito=id_carrito AND idproducto=id_producto;
END IF;
	RETURN QUERY  SELECT * FROM producto_carrito WHERE idcarrito=id_carrito AND idproducto=id_producto;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION obtener_producto_carrito_usuario(id_usuario UUID)
RETURNS SETOF producto_carrito AS
$$
DECLARE
	id_carrito UUID;
BEGIN
	id_carrito :=	obtener_carrito(id_usuario);
	RETURN QUERY  SELECT * FROM producto_carrito WHERE idcarrito=id_carrito;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION obtener_productos_info(id_usuario UUID)
RETURNS SETOF inventario AS
$$
DECLARE
	id_carrito UUID;
BEGIN
	id_carrito :=	obtener_carrito(id_usuario);
	RETURN QUERY  SELECT i.* FROM producto_carrito pc 
	JOIN inventario i ON i.idproducto=pc.idproducto
	
	WHERE pc.idcarrito=id_carrito;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION obtener_conversaciones_usuario(id_usuario UUID)
RETURNS SETOF conversacion  AS
$$
BEGIN 
	RETURN QUERY SELECT c.*
	FROM conversacion c
	JOIN ticket t ON t.idticket=c.idticket
	JOIN usuario u ON t.idusuario=u.idusuario OR t.empleado_asignado=u.idusuario
  WHERE t.idusuario=id_usuario OR t.empleado_asignado=id_usuario;
	
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION obtener_conversacion_ticket(id_ticket UUID)
RETURNS UUID AS
$$
DECLARE 
	id_conversacion UUID;
BEGIN 
	SELECT idconversacion INTO id_conversacion FROM conversacion WHERE idticket=id_ticket;
	IF (id_conversacion IS NULL) THEN
		INSERT INTO conversacion(idticket) VALUES (id_ticket) RETURNING idconversacion INTO id_conversacion ;
	END IF;
	RETURN id_conversacion;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION enviar_mensaje(id_ticket UUID, id_emisor UUID, id_receptor UUID, cuerpo varchar(1000), fecha timestamp WITH time zone)
RETURNS SETOF mensaje AS
$$
DECLARE
	id_conversacion UUID;
BEGIN
	SELECT obtener_conversacion_ticket(id_ticket) INTO id_conversacion;
	RETURN QUERY	INSERT INTO mensaje(idconversacion, idemisor, idreceptor, contenido, estado, fecha_envio) VALUES (id_conversacion,id_emisor, id_receptor, cuerpo, 'enviado', fecha) RETURNING *;
END;
$$ LANGUAGE plpgsql;

