const PermisosTabla = ({ permisos }) => {
  if (!permisos || typeof permisos !== 'object') {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Permisos en esta tabla</h3>
        <p className="text-gray-500">No tienes permisos específicos definidos para esta tabla.</p>
      </div>
    );
  }

  const { read, write, admin } = permisos;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Permisos en esta tabla</h3>
      <div className="bg-white p-3 rounded shadow-sm">
        <div className="flex flex-wrap gap-2">
          {read && (
            <div className="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-700">
              👁️ Lectura
            </div>
          )}
          {write && (
            <div className="bg-green-50 px-3 py-1 rounded-full text-sm text-green-700">
              ✏️ Escritura
            </div>
          )}
          {admin && (
            <div className="bg-purple-50 px-3 py-1 rounded-full text-sm text-purple-700">
              👑 Administrador
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermisosTabla; 