import { Encabezado, TablaStockBajo, type Ingrediente } from "./inventario";

export const dynamic = "force-dynamic";

async function obtenerTokenDeAcceso(apiUrl: string): Promise<string> {
  const usuario = process.env.AUTH_USUARIO;
  const contrasena = process.env.AUTH_CONTRASENA;
  if (!usuario || !contrasena) {
    throw new Error(
      "Las variables de entorno AUTH_USUARIO y AUTH_CONTRASENA son obligatorias",
    );
  }
  const respuesta = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, contrasena }),
  });
  if (!respuesta.ok) {
    throw new Error("No se pudo iniciar sesión en el backend de Pizza-Ya!");
  }
  const sesion: { accessToken: string } = await respuesta.json();
  return sesion.accessToken;
}

export default async function Home() {
  const apiUrl = process.env.API_URL ?? "http://localhost:3100";
  const token = await obtenerTokenDeAcceso(apiUrl);
  const respuesta = await fetch(`${apiUrl}/ingredientes/stock-bajo`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!respuesta.ok) {
    throw new Error("No se pudo cargar el inventario de Pizza-Ya!");
  }
  const ingredientes: Ingrediente[] = await respuesta.json();
  return (
    <main className="pagina">
      <Encabezado />
      <TablaStockBajo ingredientes={ingredientes} />
    </main>
  );
}
