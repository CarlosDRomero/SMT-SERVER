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
 	fila ticket%ROWTYPE;
	estadoAnterior estadosTicket;
	estadoActual estadosTicket;
BEGIN
	SELECT estado INTO estadoActual FROM ticket t WHERE t.idticket=id;
	IF estadoActual='cerrado' THEN
		SELECT estado INTO estadoAnterior FROM ultimo_estado_ticket u WHERE u.idticket=id;
		UPDATE ticket t SET estado=estadoAnterior WHERE t.idticket=id;
		RETURN QUERY SELECT * FROM ticket WHERE idticket=id;
	END IF;
	 
END;
$$ LANGUAGE plpgsql;
