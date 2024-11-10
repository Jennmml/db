import React, { useState } from 'react';

const DeleteComponent = ({ operation, handleAction }) => {
  const [id, setId] = useState('');
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = operation === 'Delete' ? await handleAction(id) : false;

    if (success) {
      setSubmit(true);
      setTimeout(() => setSubmit(false), 2000);
      setId('');
    } else {
      setError('No se pudo completar la operación');
    }
  };

  return (
    <div className="bg-white shadow-md p-6 rounded">
      <h3 className="text-lg font-semibold mb-4">{operation} Operation</h3>
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
