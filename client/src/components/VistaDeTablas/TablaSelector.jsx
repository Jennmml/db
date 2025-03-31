const TablaSelector = ({ tablas, tablaSeleccionada, onClickTabla, onInsertar }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
    {tablas.map((tabla, index) => (
      <div
        key={index}
        className={`relative cursor-pointer p-4 rounded-lg border shadow-sm text-center font-medium transition-all
          ${
            tabla.table_name === tablaSeleccionada
              ? 'bg-blue-500 text-white'
              : 'hover:bg-blue-100 hover:text-blue-700'
          }`}
        onClick={() => onClickTabla(tabla.table_name)}
      >
        {tabla.table_name}

        {/* Botón de insertar */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Evita activar el onClickTabla
            onInsertar(tabla.table_name);
          }}
          className="absolute top-2 right-2 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Insertar
        </button>
      </div>
    ))}
  </div>
);

export default TablaSelector;
