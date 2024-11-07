import React, { useState } from 'react';

const CudComponent = ({ operation, handleAction }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [age, setAge] = useState('');
  const [submit, setSubmit] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    let success = false;
    if (operation === 'Create') {
      success = handleAction(name, age);
    } else if (operation === 'Update') {
      success = handleAction(id, age);
    } else if (operation === 'Delete') {
      success = handleAction(id);
    }
    if (success) {
      setSubmit(true);
      setTimeout(() => setSubmit(false), 2000);
      setName('');
      setId('');
      setAge('');
    }
  };

  return (
    <div className="bg-white shadow-md p-6 rounded">
      <h3 className="text-lg font-semibold mb-4">{operation} Operation</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {operation === 'Create' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        )}
        {(operation === 'Update' || operation === 'Delete') && (
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">ID</label>
            <input
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        )}
        {operation !== 'Delete' && (
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
            <input
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        )}
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600">
          Submit
        </button>
        {submit && <p className="text-green-500 mt-4">Operation completed successfully</p>}
      </form>
    </div>
  );
};

export default CudComponent;