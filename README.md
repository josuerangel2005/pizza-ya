# pizza-ya

Sistema de gestión de inventario para la pizzería Pizza-Ya!: registro de ingredientes y productos con su stock, alertas cuando un producto baja de su mínimo, pedidos automáticos al proveedor correspondiente e historial de entradas y salidas para controlar el consumo semanal.

## Cómo arrancar

```bash
docker compose up --build
```

La aplicación queda disponible en los puertos publicados por `compose.yaml`.

## Tecnologías elegidas

- Next.js (generador 15.1.6)
- NestJS (generador 10.4.9)
- Base de datos: MongoDB 7.0
- Gestor de paquetes: pnpm

## Generadores

- frontend: `npx create-next-app@15.1.6 web --ts --eslint --app --src-dir --no-tailwind --no-turbopack --import-alias "@/*" --use-pnpm --skip-install --disable-git --yes` (versión 15.1.6)
- backend: `npx @nestjs/cli@10.4.9 new api --package-manager pnpm --skip-git --skip-install --strict` (versión 10.4.9)

## Desarrollo

Docker se usa solo para el entorno de desarrollo: `docker compose up` levanta la
aplicación. El build y los tests del proyecto se ejecutan directamente con el
gestor de paquetes, sin Docker.

El código fuente está montado como volumen, así que los cambios se recargan
en caliente dentro de los contenedores.
