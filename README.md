# Tecnologías

Se emplea [nodejs](https://nodejs.org/en/download/package-manager) y [pnpm](https://pnpm.io/) como manejador de paquetes, [express](https://expressjs.com/) como framework para el backend, además de implementar [docker-compose](https://docs.docker.com/compose/) para levantar las bases de datos de manera rápida para el desarrollo.

## Para inicializar
Instalación de las dependencias:

```
pnmp install
```

# Scripts importantes
Estos son los scripts disponibles en este proyecto:

- **start**
  - Comando: `pnpm run start`
  - Descripción: Inicia la aplicación en modo de producción.

- **dev**
  - Comando: `pnpm run dev`
  - Descripción: Inicia la aplicación en modo de desarrollo utilizando nodemon para reinicios automáticos.

- **lint**
  - Comando: `pnpm run lint`
  - Descripción: Ejecuta ESLint para realizar análisis estático de código y verificar cumplimiento de reglas.

- **db:dev**
  - Comando: `pnpm run db:dev`
  - Descripción: Detiene y luego inicia el contenedor de la base de datos en modo de desarrollo.

- **test**
  - Comando: `pnpm run test`
  - Descripción: Detiene el contenedor de la base de datos de prueba, luego lo inicia nuevamente y finalmente ejecuta los tests con Jest.