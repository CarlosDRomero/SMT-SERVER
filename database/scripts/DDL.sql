create type rolesUsuario as enum ('admin', 'empleado', 'cliente');

create table usuario (
  idUsuario uuid default gen_random_uuid(),
  nombres varchar(50) not null,
  apellidos varchar(50) not null,
  clave varchar(256) not null,
  rol rolesUsuario default 'cliente'::rolesUsuario,
  email varchar(100) not null unique,
  nombre_usuario varchar(50) not null unique,
  fecha_nac date not null,
  
  confirmado bool default false,
  fecha_creacion timestamp default current_timestamp,
  fecha_confirmacion timestamp,
  
  
  primary key(idUsuario)
);

create table codigos_verficiacion(
  idUsuario uuid,
  codigo varchar(6),
  
  constraint codigo_usuario foreign key(idUsuario) references usuario(idUsuario)
);
