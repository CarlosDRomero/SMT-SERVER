CREATE TYPE rolesUsuario AS enum ('admin', 'empleado', 'cliente');

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

CREATE TABLE codigos_verificacion(
  idcodigo uuid DEFAULT gen_random_uuid(),
  idusuario uuid UNIQUE,
  codigo varchar(256),
  fecha_creacion timestamp DEFAULT current_timestamp,
  PRIMARY KEY(idCodigo),
  CONSTRAINT codigo_usuario FOREIGN KEY(idUsuario) REFERENCES usuario(idUsuario) 
  ON DELETE CASCADE
);








