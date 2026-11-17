import { GiPizzaSlice } from "react-icons/gi";

export type Ingrediente = {
  nombre: string;
  cantidad: number;
  minimo: number;
};

export function Encabezado() {
  return (
    <header className="encabezado">
      <GiPizzaSlice aria-hidden="true" />
      <h1>Pizza-Ya! Inventario</h1>
    </header>
  );
}

export function TablaStockBajo({
  ingredientes,
}: {
  ingredientes: Ingrediente[];
}) {
  if (ingredientes.length === 0) {
    return <p className="vacio">No hay ingredientes con stock bajo</p>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Ingrediente</th>
          <th>Cantidad</th>
          <th>Mínimo</th>
        </tr>
      </thead>
      <tbody>
        {ingredientes.map((ingrediente) => (
          <tr key={ingrediente.nombre}>
            <td>{ingrediente.nombre}</td>
            <td>{ingrediente.cantidad}</td>
            <td>{ingrediente.minimo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
