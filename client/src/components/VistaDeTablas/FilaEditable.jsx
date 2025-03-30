const FilaEditable = ({
    fila,
    columnas,
    enEdicion,
    valoresEditados,
    setValoresEditados,
    onEditar,
    onCancelar,
    onGuardar,
    onEliminar,
  }) => {
    const llavePrimaria = columnas[0]; // asumimos que la primera columna es la PK
  
    return (
      <tr className="hover:bg-gray-50 transition duration-150 ease-in-out">
        {columnas.map((col, i) => (
          <td key={i} className="px-4 py-2 border-b border-gray-200">
            {enEdicion && col !== llavePrimaria ? (
              <input
                type="text"
                value={valoresEditados[col] ?? ''}
                onChange={(e) =>
                  setValoresEditados({
                    ...valoresEditados,
                    [col]: e.target.value,
                  })
                }
                className="w-full border px-2 py-1 rounded"
              />
            ) : (
              fila[col]?.toString()
            )}
          </td>
        ))}
        <td className="px-4 py-2 border-b border-gray-200">
          <div className="flex space-x-2 justify-center">
            {enEdicion ? (
              <>
                <button
                  className="text-green-500 hover:text-green-700 text-sm font-semibold"
                  onClick={onGuardar}
                >
                  Guardar
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
                  onClick={onCancelar}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                  onClick={() => onEditar(fila)}
                >
                  Editar
                </button>
                <button
                  className="text-red-500 hover:text-red-700 text-sm font-semibold"
                  onClick={() => onEliminar(fila)}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };
  
  export default FilaEditable;
  