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
	UPDATE usuario SET fecha_confirmado = current_timestamp WHERE	idUsuario = new.idUsuario;
	RETURN NEW;
END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE
TRIGGER codigo_confirmado
AFTER UPDATE OF confirmado ON usuario
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
		update usuario set confirmado=false where new.idUsuario=idUsuario;
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