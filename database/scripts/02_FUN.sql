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
    WHERE idusuario = idusuario_creada AND predeterminada=FALSE;

    RETURN es_primera;
END;
$$ LANGUAGE plpgsql;