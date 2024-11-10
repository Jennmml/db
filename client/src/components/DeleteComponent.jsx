import React, { useState } from 'react';

const DeleteComponent = () => {
  const [id, setId] = useState('');
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (cedula) => {
    console.log('Cedula:', cedula);
    
    try {
      const response = await fetch(`http://localhost:3000/api/borrar/${cedula}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Persona eliminada exitosamente');
        return true;
      } else {
        alert('No se pudo eliminar la persona. Persona no encontrada.');
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar persona:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleDelete(id);

    if (success) {
      setSubmit(true);
      setTimeout(() => setSubmit(false), 2000);
      setId('');
    } else {
      setError('No se pudo completar la operación');
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <div className="bg-white shadow-md p-6 rounded">
      <h3 className="text-lg font-semibold mb-4">Delete Operation</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700">ID (Cédula)</label>
          <input
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600">
          Submit
        </button>
        {submit && <p className="text-green-500 mt-4">Operación completada con éxito</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default DeleteComponent;
