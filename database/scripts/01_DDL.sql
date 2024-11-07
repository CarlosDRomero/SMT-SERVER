/* INICIAL DEL SISTEMA DE USUARIOS */

CREATE TYPE rolesUsuario AS ENUM ('admin', 'empleado', 'cliente');
CREATE TYPE estadoOrden AS ENUM ('pedido', 'enviado', 'recibido');
CREATE TYPE estadosTicket AS ENUM ('nuevo', 'aceptado', 'listo', 'en proceso', 'resuelto', 'cerrado');
CREATE TYPE prioridadTicket AS ENUM ('baja', 'media', 'alta');
CREATE TYPE estadoMensaje AS ENUM ('enviado', 'recibido', 'leido');

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
  fecha_creacion timestamp WITH TIME ZONE DEFAULT current_timestamp,
  fecha_confirmado timestamp WITH TIME ZONE,
  
  
  PRIMARY KEY(idUsuario)
);

CREATE TABLE direccion (
	iddireccion uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	idusuario uuid NOT NULL,
	predeterminada bool DEFAULT FALSE NOT NULL,
	c_dane_departamento varchar(3),
	c_dane_municipio varchar(10),
	barrio varchar(50),
	cadena_direccion varchar(100),
	
	CONSTRAINT direccion_usuario FOREIGN KEY(idusuario) REFERENCES usuario(idusuario)
	ON DELETE CASCADE
);

CREATE TABLE codigo_verificacion(
  idcodigo uuid DEFAULT gen_random_uuid(),
  idusuario uuid UNIQUE NOT NULL,
  codigo varchar(256),
  fecha_creacion timestamp WITH TIME ZONE DEFAULT current_timestamp,
  PRIMARY KEY(idcodigo),
  CONSTRAINT codigo_usuario FOREIGN KEY(idUsuario) REFERENCES usuario(idUsuario) 
  ON DELETE CASCADE
);

/* 
 * 
 * 
 * INICIAL DEL SISTEMA DE productoS COMO PRODUCTO 
 * 
 * 
 * */

CREATE TABLE atributo_espec(
	idespec serial PRIMARY KEY,
	atributo varchar(150) UNIQUE
);

CREATE TABLE categoria_producto(
	idcategoria serial PRIMARY KEY,
	denominacion varchar(75) NOT NULL UNIQUE
);

CREATE TABLE producto(
	idproducto uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	idcategoria integer NOT NULL,
	marca varchar(20) NOT NULL,
	nombre varchar(500) NOT NULL,
	disponibilidad integer,
	precio float,
	descripcion text NOT NULL,
	url_imagen varchar(500) NOT NULL,
	CONSTRAINT categoria_producto FOREIGN KEY(idcategoria) REFERENCES categoria_producto(idcategoria)
	
);

CREATE TABLE producto_espec(
	idespec integer NOT NULL,
	idproducto uuid NOT NULL,
	valor TEXT,
	
	PRIMARY KEY (idespec, idproducto),
	CONSTRAINT espec_producto FOREIGN KEY (idespec) REFERENCES atributo_espec(idespec)  ON DELETE CASCADE,
	CONSTRAINT producto_espec FOREIGN KEY (idproducto) REFERENCES producto(idproducto) ON DELETE CASCADE
);

CREATE TABLE promocion(
	idpromocion serial PRIMARY KEY,
	idusuario uuid,
	
	asunto varchar(30) NOT NULL,
	descripcion varchar(500),
	porcentaje float,
	fecha_inicio timestamp WITH TIME ZONE DEFAULT current_timestamp,
	fecha_fin timestamp WITH TIME ZONE,
	
	CONSTRAINT cupon_usuario FOREIGN KEY (idusuario) REFERENCES usuario(idusuario)
);

CREATE TABLE promocion_categoria(
	idpromocion integer NOT NULL,
	idcategoria integer NOT NULL,
	
	PRIMARY KEY (idpromocion, idcategoria),
	CONSTRAINT promocion_categoria FOREIGN KEY (idpromocion) REFERENCES promocion(idpromocion),
	CONSTRAINT categoria_promocion FOREIGN KEY (idcategoria) REFERENCES categoria_producto(idcategoria)
);

/*
 * 
 * TABLAS DE PROCESO DE COMPRAS
 * 
 * */

CREATE TABLE carrito_compras(
	idcarrito uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	idusuario uuid NOT NULL UNIQUE,
	
	CONSTRAINT carrito_usuario FOREIGN KEY (idusuario) REFERENCES usuario(idusuario) ON DELETE CASCADE
);

CREATE TABLE producto_carrito(
	idcarrito uuid NOT NULL,
	idproducto uuid NOT NULL,
	cantidad integer NOT NULL,
	
	PRIMARY KEY (idcarrito, idproducto),
	CONSTRAINT carrito_producto FOREIGN KEY (idcarrito) REFERENCES carrito_compras(idcarrito) ON DELETE CASCADE,
	CONSTRAINT producto_carrito FOREIGN KEY (idproducto) REFERENCES producto(idproducto) ON DELETE CASCADE
);

CREATE TABLE orden_compra(
	idorden uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	idusuario uuid NOT NULL,
	iddireccion uuid,
	estado estadoOrden DEFAULT 'pedido'::estadoOrden,
	costo_total integer DEFAULT 0,
	costo_final integer DEFAULT 0,
	fecha_orden timestamp WITH TIME ZONE DEFAULT current_timestamp,
	
	CONSTRAINT orden_usuario FOREIGN KEY (idusuario) REFERENCES usuario(idusuario),
	CONSTRAINT orden_direccion FOREIGN KEY (iddireccion) REFERENCES direccion(iddireccion)
	
);

CREATE TABLE producto_orden(
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	idorden uuid NOT NULL,
	idproducto uuid NOT NULL,
	cantidad integer DEFAULT 1,
	costo integer DEFAULT 0,
	
	CONSTRAINT orden_producto FOREIGN KEY (idorden) REFERENCES orden_compra(idorden),
	CONSTRAINT producto_orden FOREIGN KEY (idproducto) REFERENCES producto(idproducto)
);

CREATE TABLE evento_notificacion(
	idevento serial PRIMARY KEY,
	evento varchar(50) NOT NULL UNIQUE
);

CREATE TABLE tipo_receptor(
	idtipo serial PRIMARY KEY,
	tipo varchar(50) NOT NULL UNIQUE
);

CREATE TABLE notificacion(
	idnotificacion uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	idevento integer NOT NULL,
	idtipo integer NOT NULL,
	idusuario_iniciador uuid,
	idusuario_notificado uuid,
	roles_notificados rolesUsuario[],
	
	idfuente uuid,
	mensaje varchar(500),
	fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp,
	
	CONSTRAINT notificacion_evento FOREIGN KEY (idevento) REFERENCES evento_notificacion(idevento),
	CONSTRAINT notificacion_tipo FOREIGN KEY (idtipo) REFERENCES tipo_receptor(idtipo),
	CONSTRAINT usuario_notificante FOREIGN KEY (idusuario_iniciador) REFERENCES usuario(idusuario) ON DELETE CASCADE,
	CONSTRAINT usuario_notificado FOREIGN KEY (idusuario_notificado) REFERENCES usuario(idusuario) ON DELETE CASCADE
);

CREATE TABLE vistas_notificacion(
	idnotificacion uuid NOT NULL,
	idusuario uuid NOT NULL,
	
	PRIMARY KEY (idnotificacion, idusuario),
	CONSTRAINT notificacion_vista FOREIGN KEY (idnotificacion) REFERENCES notificacion(idnotificacion) ON DELETE CASCADE,
	CONSTRAINT visto_usuario FOREIGN KEY (idusuario) REFERENCES usuario(idusuario) ON DELETE CASCADE
);


/*
 * 
 * TABLAS PARA TICKETS Y CONVERSACIONES
 * 
 * */

CREATE TABLE tipo_servicio(
	idtipo_servicio serial PRIMARY KEY,
	tipo_servicio varchar(50) NOT NULL UNIQUE,
	descripcion varchar(2000) NOT NULL,
	url_imagen varchar(500)
);

CREATE TABLE ticket(
	idticket uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	empleado_asignado uuid,
	idtipo_servicio integer,
	
	email varchar(100),
	idusuario uuid,
	asunto varchar(100) NOT NULL,
	contenido varchar(2000) NOT NULL,
	estado estadosTicket DEFAULT 'nuevo'::estadosTicket,
	prioridad prioridadTicket,
	reabierto integer DEFAULT 0,
	fecha_creacion timestamp WITH TIME ZONE DEFAULT current_timestamp,
	fecha_actualizacion timestamp WITH TIME ZONE,
	
	CONSTRAINT empleado_ticket FOREIGN KEY (empleado_asignado) REFERENCES usuario(idusuario) ON DELETE SET NULL,
	CONSTRAINT usuario_ticket FOREIGN KEY (idusuario) REFERENCES usuario(idusuario) ON DELETE CASCADE,
	CONSTRAINT ticket_tipo_servicio FOREIGN KEY (idtipo_servicio) REFERENCES tipo_servicio(idtipo_servicio) ON DELETE SET NULL
);

CREATE TABLE calificacion_ticket(
	idticket UUID PRIMARY KEY,
	valor integer NOT NULL,
	comentario varchar(500),

	CONSTRAINT calificacion_ticket FOREIGN KEY (idticket) REFERENCES ticket(idticket) ON DELETE CASCADE
);

CREATE TABLE ultimo_estado_ticket(
	idticket uuid PRIMARY KEY,
	estado estadosTicket,
	
	CONSTRAINT estado_ticket FOREIGN KEY (idticket) REFERENCES ticket(idticket)
);

CREATE TABLE conversacion(
	idconversacion uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
	idticket uuid NOT NULL UNIQUE,
	iddependiente uuid,
	CONSTRAINT conversacion_ticket FOREIGN KEY (idticket) REFERENCES ticket(idticket) ON DELETE CASCADE
);


CREATE TABLE mensaje(
	idconversacion uuid NOT NULL,
	idmensaje uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	idemisor uuid,
	idreceptor uuid NOT NULL,
	
	contenido varchar(500) NOT NULL,
	estado estadoMensaje NOT NULL,
	fecha_envio timestamp WITH TIME ZONE DEFAULT current_timestamp,
	
	CONSTRAINT conversacion FOREIGN KEY (idconversacion) REFERENCES conversacion(idconversacion) ON DELETE CASCADE,
	CONSTRAINT emisor_mensaje FOREIGN KEY (idemisor) REFERENCES usuario(idusuario) ON DELETE CASCADE,
	CONSTRAINT receptor_mensaje FOREIGN KEY (idreceptor) REFERENCES usuario(idusuario) ON DELETE CASCADE
	
);


CREATE VIEW vista_clientes AS SELECT * FROM usuario WHERE rol='cliente';
CREATE VIEW vista_empleados AS SELECT * FROM usuario WHERE rol='empleado';
CREATE VIEW vista_admins AS SELECT * FROM usuario WHERE rol='admin';
CREATE VIEW vista_estados_ticket AS SELECT ROW_NUMBER() OVER()  AS num,estado  FROM (select unnest(enum_range(NULL::estadosticket)) as estado );
CREATE VIEW vista_prioridad_ticket AS SELECT ROW_NUMBER() OVER()  AS num,prioridad  FROM (select unnest(enum_range(NULL::prioridadticket)) as prioridad)


