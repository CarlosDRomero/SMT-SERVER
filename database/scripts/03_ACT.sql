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
	NEW.predeterminada := TRUE;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER primer_direccion
BEFORE INSERT ON direccion
FOR EACH ROW
WHEN (es_primer_direccion(NEW.idusuario))
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
AFTER UPDATE OF predeterminada ON direccion
FOR EACH ROW
WHEN (NEW.predeterminada=TRUE AND OLD.predeterminada=FALSE)
EXECUTE FUNCTION limpiar_predeterminadas();