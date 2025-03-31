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
  columnPermisos = {}
}) => (
  <div className="overflow-x-auto rounded-lg border shadow">
    <table className="min-w-full text-sm text-left border-collapse">
      <thead className="bg-gray-100 text-gray-700">
        <tr>
          {columnas.map((col, i) => (
            <th key={i} className="px-4 py-3 border-b border-gray-300">
              <div className="flex flex-col">
                <span className="uppercase text-xs mb-1">{col}</span>
                <div className="flex gap-1">
                  {columnPermisos[col]?.read && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      👁️
                    </span>
                  )}
                  {columnPermisos[col]?.write && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      ✏️
                    </span>
                  )}
                </div>
              </div>
            </th>
          ))}
          <th className="px-4 py-3 border-b border-gray-300 text-center uppercase text-xs">
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
