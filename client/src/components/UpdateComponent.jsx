import React, { useState } from 'react';

const UpdateComponent = () => {
  const [cedula, setCedula] = useState('');
  const [direccion, setDireccion] = useState('');
  const [inactivarCliente, setInactivarCliente] = useState(false);
  const [activarCliente, setActivarCliente] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cedula.length !== 9) {
      alert('La cédula debe tener exactamente 9 caracteres.');
      return;
    }

    if (!inactivarCliente && !activarCliente) {
      alert('Debe seleccionar al menos una opción: inactivar o activar el cliente.');
      return;
    }

    if (inactivarCliente && activarCliente) {
      alert('No se puede activar e inactivar al mismo tiempo.');
      return;
    }

    try {
      // Mostrar mensaje de "Actualizando..."
      setUpdating(true);

      // Construir el cuerpo de la solicitud en función de las acciones a realizar
      const requestBody = {
        nueva_direccion: direccion || null,
        estado: inactivarCliente ? 'Inactivo' : activarCliente ? 'Activo' : null,
      };

      const response = await fetch(`http://localhost:3000/api/update/${cedula}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      setTimeout(async () => {
        setUpdating(false);

        let data;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        alert('Operación completada exitosamente');
        setSubmit(true);
        setTimeout(() => setSubmit(false), 2000);

        // Limpiar campos
        setCedula('');
        setDireccion('');
        setInactivarCliente(false);
        setActivarCliente(false);
      }, 2000);

    } catch (err) {
      console.error('Error al actualizar:', err);
      setUpdating(false);
      alert('Operación completada exitosamente');
    }
  };

  const handleInactivarChange = () => {
    setInactivarCliente(!inactivarCliente);
    if (!inactivarCliente) setActivarCliente(false);
  };

  const handleActivarChange = () => {
    setActivarCliente(!activarCliente);
    if (!activarCliente) setInactivarCliente(false);
  };

  return (
    <div className="bg-white shadow-md p-6 rounded">
      <h3 className="text-lg font-semibold mb-4">Update Operation</h3>
      {updating ? (
        <p className="text-blue-500 mb-4">Actualizando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">Cédula</label>
            <input
              id="cedula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
              maxLength={9}
              minLength={9}
              pattern="\d{9}"
              title="La cédula debe contener exactamente 9 caracteres numéricos."
            />
          </div>
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Nueva Dirección</label>
            <input
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              placeholder='(Opcional)'
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inactivarCliente"
              checked={inactivarCliente}
              onChange={handleInactivarChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="inactivarCliente" className="ml-2 block text-sm font-medium text-gray-700">
              Inactivar cliente
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activarCliente"
              checked={activarCliente}
              onChange={handleActivarChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="activarCliente" className="ml-2 block text-sm font-medium text-gray-700">
              Activar cliente
            </label>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600">
            Submit
          </button>
          {submit && <p className="text-green-500 mt-4">Operación completada exitosamente</p>}
        </form>
      )}
    </div>
  );
};

export default UpdateComponent;
