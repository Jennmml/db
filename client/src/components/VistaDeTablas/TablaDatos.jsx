import FilaEditable from "./FilaEditable";

const TablaDatos = ({
  columnas,
  datos,
  editandoFila,
  valoresEditados,
  setValoresEditados,
  onEditar,
  onCancelar,
  onGuardar,
  onEliminar,
}) => (
  <div className="overflow-x-auto rounded-lg border shadow">
    <table className="min-w-full text-sm text-left border-collapse">
      <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
        <tr>
          {columnas.map((col, i) => (
            <th key={i} className="px-4 py-3 border-b border-gray-300">
              {col}
            </th>
          ))}
          <th className="px-4 py-3 border-b border-gray-300 text-center">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {datos.map((fila, i) => (
          <FilaEditable
            key={i}
            fila={fila}
            columnas={columnas}
            enEdicion={editandoFila === fila}
            valoresEditados={valoresEditados}
            setValoresEditados={setValoresEditados}
            onEditar={onEditar}
            onCancelar={onCancelar}
            onGuardar={onGuardar}
            onEliminar={onEliminar}
          />
        ))}
      </tbody>
    </table>
  </div>
);

export default TablaDatos;
