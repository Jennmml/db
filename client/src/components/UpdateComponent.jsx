import React, { useState } from 'react';

const UpdateComponent = () => {
  const [cedula, setCedula] = useState('');
  const [direccion, setDireccion] = useState('');
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/api/update/${cedula}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nueva_direccion: direccion }),
      });

      console.log('Estado de la respuesta:', response.status);

      // Verificar el tipo de contenido antes de intentar convertirlo a JSON
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text(); // Para manejar respuestas que no son JSON
        console.warn('La respuesta no era JSON:', data);
      }

      if (response.ok) {
        setSubmit(true);
        setTimeout(() => setSubmit(false), 2000);
        // Limpiar campos
        setCedula('');
        setDireccion('');
      } else {
        setError(data.message || data || 'Error en la actualización de la dirección.');
      }
    } catch (err) {
      console.error('Error al actualizar la dirección:', err);
      setError('Ocurrió un error al actualizar la dirección. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="bg-white shadow-md p-6 rounded">
      <h3 className="text-lg font-semibold mb-4">Update Operation</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">Cédula</label>
          <input
            id="cedula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Nueva Dirección</label>
          <input
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600">
          Submit
        </button>
        {submit && <p className="text-green-500 mt-4">Dirección actualizada exitosamente</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default UpdateComponent;
