import { Encabezado, TablaStockBajo, type Ingrediente } from "./inventario";

export default async function Home() {
  const apiUrl = process.env.API_URL ?? "http://localhost:3100";
  const respuesta = await fetch(`${apiUrl}/ingredientes/stock-bajo`, {
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
