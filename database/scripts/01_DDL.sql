CREATE TYPE rolesUsuario AS ENUM ('admin', 'empleado', 'cliente');

CREATE TABLE usuario (
  idusuario uuid DEFAULT gen_random_uuid(),
  nombres varchar(50) NOT NULL,
  apellidos varchar(50) NOT NULL,
  clave varchar(256) NOT NULL,
  rol rolesUsuario DEFAULT 'cliente'::rolesUsuario,
  email varchar(100) NOT NULL UNIQUE,
  nombre_usuario varchar(50) NOT NULL UNIQUE,
  fecha_nac date NOT NULL,

  confirmado bool DEFAULT FALSE,
  fecha_creacion timestamp DEFAULT current_timestamp,
  fecha_confirmado timestamp,
  
  
  PRIMARY KEY(idUsuario)
);

CREATE TABLE direccion (
	iddireccion uuid DEFAULT gen_random_uuid(),
	idusuario uuid NOT NULL,
	predeterminada bool DEFAULT FALSE NOT NULL,
	c_dane_departamento varchar(3),
	c_dane_municipio varchar(5),
	barrio varchar(50),
	cadena_direccion varchar(100),
	
	CONSTRAINT direccion_usuario FOREIGN KEY(idusuario) REFERENCES usuario(idusuario)
	ON DELETE CASCADE
);

CREATE TABLE codigo_verificacion(
  idcodigo uuid DEFAULT gen_random_uuid(),
  idusuario uuid UNIQUE NOT NULL,
  codigo varchar(256),
  fecha_creacion timestamp DEFAULT current_timestamp,
  PRIMARY KEY(idcodigo),
  CONSTRAINT codigo_usuario FOREIGN KEY(idUsuario) REFERENCES usuario(idUsuario) 
  ON DELETE CASCADE
);


CREATE VIEW vista_clientes AS SELECT * FROM usuario WHERE rol='cliente';
CREATE VIEW vista_empleados AS SELECT * FROM usuario WHERE rol='empleado';
CREATE VIEW vista_admins AS SELECT * FROM usuario WHERE rol='admin';




