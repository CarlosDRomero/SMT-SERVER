/*
 * 
 * esta funcion junto con el trigger "codigo_confirmado" se ejecutara para limpiar
 * el codigo de verificacion de la tabla una vez su dueño lo haya redimido
 * 
 * */
CREATE OR REPLACE
FUNCTION eliminar_codigo_confirmacion()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM	codigo_verificacion WHERE	idUsuario = new.idUsuario;
	NEW.fecha_confirmado = current_timestamp;
	IF NEW.rol = 'cliente' THEN
		RAISE NOTICE 'Nuevo correo electrónico: %', NEW.email;
		UPDATE ticket SET idusuario=NEW.idusuario, email=NULL WHERE email=NEW.email;
	END IF;
	RETURN NEW;
END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE
TRIGGER codigo_confirmado
BEFORE UPDATE OF confirmado ON usuario
FOR EACH ROW
WHEN (old.confirmado = FALSE AND new.confirmado = TRUE)
EXECUTE FUNCTION eliminar_codigo_confirmacion();

/*
 * 
 * esta funcion junto con el trigger "usuario_eliminado" se ejecutara para limpiar
 * el codigo de verificacion de la tabla una vez su dueño lo haya redimido
 * 
 * */
CREATE OR REPLACE
FUNCTION cambiar_ticket_correo()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW.rol = 'cliente' THEN
		UPDATE ticket SET idusuario=NULL, email=NEW.email WHERE idusuario=NEW.idusuario;
	END IF;
	RETURN NEW;
END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE
TRIGGER usuario_eliminado
BEFORE UPDATE OF confirmado ON usuario
FOR EACH ROW
WHEN (old.confirmado = FALSE AND new.confirmado = TRUE)
EXECUTE FUNCTION eliminar_codigo_confirmacion();


/*
 * 
 * esta funcion junto con el trigger "nuevo_codigo_confirmacion" se ejecutara para
 * cambiar el valor de "confirmado" a falso del usuario al que se le dio un nuevo codigo
 * 
 * */

create or replace function cambiar_confirmado()
returns trigger as $$
	begin
		update usuario set confirmado=false where new.idusuario=idusuario;
		return new;
	end;
	
$$ language plpgsql;

create or replace trigger nuevo_codigo_confirmacion
after insert on codigo_verificacion
for each row
execute function cambiar_confirmado();
/*
 * 
 * esta funcion junto con el trigger "actualizado_codigo_verificacion" se ejecutara para
 * cambiar el valor de la "fecha_creacion" a la actual en el momento en que se cambie a
 * un nuevo codigo
 * 
 * */



create or replace function actualizar_fecha_codigo()
returns trigger as $$
	begin
		update codigo_verificacion set fecha_creacion=current_timestamp where new.idUsuario=idUsuario;
		return new;
	end;
	
$$ language plpgsql;

create or replace trigger actualizado_codigo_verificacion
after update of codigo on codigo_verificacion
for each row
execute function actualizar_fecha_codigo();



/*
 * 
 * esta funcion junto con el trigger "primer_direccion" se ejecutara para
 * cambiar el valor "predeterminada" a verdadero si es la primera direccion que se crea para
 * un usuario
 * 
 * */



CREATE OR REPLACE FUNCTION hacer_predeterminada()
RETURNS TRIGGER AS $$
BEGIN
	IF es_primer_direccion(NEW.idusuario) THEN
		NEW.predeterminada := TRUE;
	ELSE 
		IF (NEW.predeterminada=TRUE) THEN
			UPDATE direccion SET predeterminada=FALSE WHERE predeterminada=TRUE;
		END IF;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER primer_direccion
BEFORE INSERT ON direccion
FOR EACH ROW
EXECUTE FUNCTION hacer_predeterminada();

/*
 * 
 * esta funcion junto con el trigger "nueva_predeterminada" se ejecutara para
 * cambiar el valor "predeterminada" a falso de la anterior direccion predeterminada
 * dejando siempre solo una direccion como predeterminada
 * 
 * */



CREATE OR REPLACE FUNCTION limpiar_predeterminadas()
RETURNS TRIGGER AS $$
BEGIN
	UPDATE direccion SET predeterminada = FALSE 
	WHERE iddireccion<>NEW.iddireccion AND  idusuario = NEW.idusuario AND predeterminada=TRUE;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER nueva_predeterminada
BEFORE UPDATE OF predeterminada ON direccion
FOR EACH ROW
WHEN (NEW.predeterminada=TRUE AND OLD.predeterminada=FALSE)
EXECUTE FUNCTION limpiar_predeterminadas();

/*
 * 
 * esta funcion junto con el trigger "especificacion_producto" se ejecutara para
 * evitar que se inserte una especificacion de un producto cuya categoria no la incluye
 * 
 * */




/*TODO:IMPORTANTE > MANEJAR EL CASO EN QUE SE CAMBIE LA CATEGORIA DE UN PRODUCTO*/

/*
 * 
 * esta funcion junto con el trigger "cambio_categoria" se ejecutara para
 * buscar las especificaciones de la nueva categoria que aun se pueden mantener
 * 
 * */




/*
 * 
 * esta funcion junto con el trigger "ticket_listo" se ejecutara para
 * buscar las especificaciones de la nueva categoria que aun se pueden mantener
 * 
 * */



CREATE OR REPLACE FUNCTION actualizar_estado_ticket()
RETURNS TRIGGER AS $$
BEGIN
		IF (NEW.empleado_asignado IS NOT NULL AND OLD.empleado_asignado IS NULL) THEN
			IF (NEW.idtipo_servicio IS NULL) OR (NEW.prioridad IS NULL) THEN
				NEW.estado := 'aceptado';
			END IF;
			IF (NEW.idtipo_servicio IS NOT NULL AND NEW.prioridad IS NOT NULL) THEN
				NEW.estado='en proceso';
			END IF;
			RETURN NEW;
		END IF;
	IF (OLD.idtipo_servicio IS NULL AND NEW.idtipo_servicio IS NOT NULL) AND (OLD.prioridad IS NULL AND NEW.prioridad IS NOT NULL) THEN
		IF (NEW.empleado_asignado IS NOT NULL) THEN
			NEW.estado := 'en proceso';
		END IF;
		IF (NEW.empleado_asignado IS NULL) THEN
			NEW.estado := 'listo';
		END IF;
	END IF;
	IF (OLD.idtipo_servicio IS NOT NULL AND NEW.idtipo_servicio IS NULL) OR (OLD.prioridad IS NOT NULL AND NEW.prioridad IS NULL) THEN 
		NEW.estado := 'aceptado';
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER ticket_listo
BEFORE UPDATE OF idtipo_servicio, prioridad, empleado_asignado ON ticket
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_ticket();

/*
 * 
 * esta funcion junto con el trigger "ticket_cerrado" se ejecutara para
 * buscar las especificaciones de la nueva categoria que aun se pueden mantener
 * 
 * */



CREATE OR REPLACE FUNCTION respaldo_estado()
RETURNS TRIGGER AS $$
BEGIN
	IF (OLD.estado='resuelto') THEN
		INSERT INTO ultimo_estado_ticket(idticket, estado) VALUES (OLD.idticket, 'listo');
	ELSE 
		INSERT INTO ultimo_estado_ticket(idticket, estado) VALUES (OLD.idticket, OLD.estado);
	END IF;
	NEW.empleado_asignado := NULL;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER ticket_cerrado
BEFORE UPDATE OF estado ON ticket
FOR EACH ROW
WHEN (NEW.estado='cerrado' AND OLD.estado<>'cerrado')
EXECUTE FUNCTION respaldo_estado();



