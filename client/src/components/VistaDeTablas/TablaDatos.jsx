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
  columnPermisos = {},
  modo,
  setModo,
  previewQuery,
  setPreviewQuery
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Modo:</label>
          <select
            value={modo}
            onChange={(e) => {
              setModo(e.target.value);
              setPreviewQuery(''); // Limpiar query al cambiar de modo
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="execute">Ejecutar</option>
            <option value="preview">Vista previa</option>
          </select>
        </div>
      </div>

      {/* Preview Query Display */}
      {modo === 'preview' && previewQuery && (
        <div className="mb-4 mx-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Query Generada:</h3>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-3 rounded border">
              {previewQuery}
            </pre>
          </div>
        </div>
      )}

      <div className="shadow-sm rounded-lg overflow-hidden mx-4">
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
    </div>
  );
};

export default TablaDatos;
