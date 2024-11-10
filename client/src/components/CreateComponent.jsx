import React, { useState } from 'react';

const CreateComponent = () => {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido1, setApellido1] = useState('');
  const [apellido2, setApellido2] = useState('');
  const [genero, setGenero] = useState('');
  const [direccion, setDireccion] = useState('');
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedula,
          nombre,
          apellido_1: apellido1,
          apellido_2: apellido2,
          genero,
          direccion,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setSubmit(true);
        setTimeout(() => setSubmit(false), 2000);
        // Limpiar campos
        setCedula('');
        setNombre('');
        setApellido1('');
        setApellido2('');
        setGenero('');
        setDireccion('');
      } else {
        setError(data.message || 'Error en la creación del usuario.');
      }
    } catch (err) {
      console.error('Error al crear el usuario:', err);
      setError('Ocurrió un error al crear el usuario. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="bg-white shadow-md p-6 rounded">
      <h3 className="text-lg font-semibold mb-4">Create Operation</h3>
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
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="apellido1" className="block text-sm font-medium text-gray-700">Apellido 1</label>
          <input
            id="apellido1"
            value={apellido1}
            onChange={(e) => setApellido1(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="apellido2" className="block text-sm font-medium text-gray-700">Apellido 2</label>
          <input
            id="apellido2"
            value={apellido2}
            onChange={(e) => setApellido2(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="genero" className="block text-sm font-medium text-gray-700">Género</label>
          <select
            id="genero"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
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
        {submit && <p className="text-green-500 mt-4">Usuario creado exitosamente</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default CreateComponent;
