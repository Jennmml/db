import React, { useState } from 'react';

const CudComponent = ({ operation, handleAction }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [age, setAge] = useState('');
  const [submit, setSubmit] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    if (operation === 'Create') {
      success = await handleAction(name, age);  // Pasar name y age en Create
    } else if (operation === 'Update') {
      success = await handleAction(id, age);  // Pasar id y age en Update
    } else if (operation === 'Delete') {
      success = await handleAction(id);  // Pasar solo id en Delete
    }
    if (!success) {
      setSubmit(true);
      setTimeout(() => setSubmit(false), 2000);  // Resetear el estado de submit después de 3 segundos
      setName('');
      setId('');
      setAge('');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">{operation} Operation</h1>
      <form onSubmit={handleSubmit}>
        {operation === 'Create' && (
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={operation === 'Create'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        {(operation === 'Update' || operation === 'Delete') && (
          <div className="mb-4">
            <label htmlFor="id" className="block text-gray-700 font-bold mb-2">ID:</label>
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        {operation !== 'Delete' && (
          <div className="mb-4">
            <label htmlFor="age" className="block text-gray-700 font-bold mb-2">Age:</label>
            <input
              type="text"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Submit
        </button>
        {submit && <p className="text-green-500 mt-4">Operation done successfully</p>}
      </form>
    </div>
  );
};

export default CudComponent;