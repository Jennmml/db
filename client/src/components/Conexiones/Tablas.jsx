
const VistaDeTablas = ({
  tablas,
  tablaSeleccionada,
  datosTabla,
  onClickTabla, 
}) => {


  return (
    <div className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {tablas.map((tabla, index) => (
          <div
            key={index}
            className={`cursor-pointer p-4 rounded-lg border shadow-sm bg-white text-center font-medium transition-all
              ${
                tabla.table_name === tablaSeleccionada
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-blue-100 hover:text-blue-700'
              }`}
            onClick={() => onClickTabla(tabla.table_name)}
          >
            {tabla.table_name}
          </div>
        ))}
      </div>

      {tablaSeleccionada && (
        <>
          {datosTabla.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border shadow">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    {Object.keys(datosTabla[0]).map((col, i) => (
                      <th key={i} className="px-4 py-3 border-b border-gray-300">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {datosTabla.map((fila, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 transition duration-150 ease-in-out"
                    >
                      {Object.values(fila).map((valor, j) => (
                        <td key={j} className="px-4 py-2 border-b border-gray-200">
                          {valor?.toString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center mt-6 text-gray-500">
              No hay datos en esta tabla.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default VistaDeTablas;
