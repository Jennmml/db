import React from 'react';

// Función para formatear la fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'; // Manejar fechas vacías o nulas
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const ReadComponent = ({ data, selectedType, handleTypeChange }) => {
  return (
    <div className="bg-white shadow-md p-6 rounded">
      <h3 className="text-lg font-semibold mb-4">What do you want to consult?</h3>
      <select
        className="mb-4 p-2 border border-gray-300 rounded"
        onChange={handleTypeChange}
        value={selectedType}
      >
        <option value="">Select an option</option>
        <option value="personas">Personas</option>
        <option value="clientes">Clientes</option>
        <option value="colaboradores">Colaboradores</option>
        <option value="agentes">Agentes</option>
      </select>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.cedula || item.id} className="border-b pb-2">
            {selectedType === 'personas' && (
              <>
                <p className="text-gray-600">{item.nombre} {item.apellido1} {item.apellido2}</p>
                <p className="text-gray-600">Cédula: {item.cedula}</p>
                <p className="text-gray-600">Género: {item.genero}</p>
                <p className="text-gray-600">Dirección: {item.direccion}</p>
              </>
            )}

            {selectedType === 'clientes' && (
              <>
                <p className="text-gray-600">Empresa Asociada: {item.empresa_asociada}</p>
                <p className="text-gray-600">Estado: {item.estado}</p>
                <p className="text-gray-600">Fecha de Registro: {formatDate(item.fecha_de_registro)}</p>
              </>
            )}

            {selectedType === 'colaboradores' && (
              <>
                <p className="text-gray-600">Departamento: {item.departamento}</p>
                <p className="text-gray-600">Rol de Contrato: {item.rol_contrato}</p>
                <p className="text-gray-600">Banda: {item.banda}</p>
                <p className="text-gray-600">Estado: {item.estado}</p>
                <p className="text-gray-600">Fecha de Incorporación: {formatDate(item.fecha_de_incorporacion)}</p>
              </>
            )}

            {selectedType === 'agentes' && (
              <>
                <p className="text-gray-600">Estado: {item.estado}</p>
                <p className="text-gray-600">Número de Contratos Asignados: {item.numero_de_contratos_asignados}</p>
                <p className="text-gray-600">Reuniones Asociadas: {item.reuniones_asociadas}</p>
                <p className="text-gray-600">Contratos Asociados: {item.contratos_asociados}</p>
                <p className="text-gray-600">Fecha de Registro: {formatDate(item.fecha_de_registro)}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadComponent;
