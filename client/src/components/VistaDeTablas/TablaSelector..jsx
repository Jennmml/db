const TablaSelector = ({ tablas, tablaSeleccionada, onClickTabla }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      {tablas.map((tabla, index) => (
        <div
          key={index}
          className={`cursor-pointer p-4 rounded-lg border shadow-sm text-center font-medium transition-all
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
  );
  
  export default TablaSelector;
  