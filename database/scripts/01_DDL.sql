/* INICIAL DEL SISTEMA DE USUARIOS */

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

/* 
 * 
 * 
 * INICIAL DEL SISTEMA DE COMPONENTES COMO PRODUCTO 
 * 
 * 
 * */

CREATE TABLE atributo_espec(
	idespec serial PRIMARY KEY,
	atributo varchar(150) UNIQUE
);

CREATE TABLE categoria_componente(
	idcategoria serial PRIMARY KEY,
	denominacion varchar(30) UNIQUE
);

CREATE TABLE categoria_espec(
	idcat_espec serial PRIMARY KEY,
	idespec integer NOT NULL,
	idcategoria integer NOT NULL,
	
	CONSTRAINT espec_categoria FOREIGN KEY (idespec) REFERENCES atributo_espec(idespec)  ON DELETE CASCADE,
	CONSTRAINT categoria_espec FOREIGN KEY (idcategoria) REFERENCES categoria_componente(idcategoria)
);

CREATE TABLE componente(
	idcomponente uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	idcategoria integer NOT NULL,
	marca varchar(20) NOT NULL,
	nombre varchar(50) NOT NULL,
	descripcion varchar(1000) NOT NULL,
	url_imagen varchar(500) NOT NULL,
	
	CONSTRAINT categoria_componente FOREIGN KEY(idcategoria) REFERENCES categoria_componente(idcategoria)
	
);

CREATE TABLE componente_espec(
	idcat_espec integer NOT NULL,
	idcomponente uuid NOT NULL,
	valor varchar(100),
	
	PRIMARY KEY (idcat_espec, idcomponente),
	CONSTRAINT cat_espec_componente FOREIGN KEY (idcat_espec) REFERENCES categoria_espec(idcat_espec)  ON DELETE CASCADE,
	CONSTRAINT componente_cat_espec FOREIGN KEY (idcomponente) REFERENCES componente(idcomponente) ON DELETE CASCADE
);

CREATE TABLE inventario(
	idproducto uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	idcomponente uuid NOT NULL,
	SKU varchar(22) UNIQUE,
	disponibilidad integer,
	precio float,
	
	CONSTRAINT unique_sku_componente UNIQUE(idcomponente, SKU),
	CONSTRAINT inventario_componente FOREIGN KEY (idcomponente) REFERENCES componente(idcomponente) ON DELETE CASCADE
);

CREATE VIEW vista_clientes AS SELECT * FROM usuario WHERE rol='cliente';
CREATE VIEW vista_empleados AS SELECT * FROM usuario WHERE rol='empleado';
CREATE VIEW vista_admins AS SELECT * FROM usuario WHERE rol='admin';




