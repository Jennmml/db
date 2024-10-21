import { useState } from 'react';
import './App.css';
import Operation from './components/operationComponent';
import CudComponent from './components/CudComponent';
import ReadComponent from './components/ReadComponent';

function App() {
  const [clickedButton, setClickedButton] = useState('');
  const [usersData, setUsersData] = useState([]);
  const [operationDone, setOperationDone] = useState('');

  const handleClick = (button) => {
    setClickedButton(button);
  };

  const handleUserData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/personas');
      const data = await response.json();
      setUsersData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Función para crear (POST)
  const handleCreate = async (name, age) => {
    try {
      const response = await fetch('http://localhost:3000/api/insertar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, age }),  // Enviar datos como JSON
      });
      const result = await response.text();
      console.log(result);
      setOperationDone('Create');
      handleUserData(); // Actualizar datos después de la creación
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Función para actualizar (PUT)
  const handleUpdate = async (id, age) => {
    try {
      const response = await fetch('http://localhost:3000/api/actualizar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, age }),  // Enviar id y age como JSON
      });
      const result = await response.text();
      console.log(result);
      setOperationDone('Update');
      handleUserData(); // Actualizar datos después de la actualización
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Función para borrar (DELETE)
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/borrar?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.text();
      console.log(result);
      setOperationDone('Delete');
      handleUserData(); // Actualizar datos después de la eliminación
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-10">
      <nav className="flex gap-4 bg-gray-800 p-4 rounded shadow-lg">
        <Operation operationName="Create" selectedButton={() => handleClick('Create')} />
        <Operation operationName="Read" selectedButton={() => handleClick('Read')} additionalAction={handleUserData} />
        <Operation operationName="Update" selectedButton={() => handleClick('Update')} />
        <Operation operationName="Delete" selectedButton={() => handleClick('Delete')} />
      </nav>

      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
        {clickedButton === 'Create' && <CudComponent operation="Create" handleAction={handleCreate} />}
        {clickedButton === 'Update' && <CudComponent operation="Update" handleAction={handleUpdate} />}
        {clickedButton === 'Delete' && <CudComponent operation="Delete" handleAction={handleDelete} />}
        {clickedButton === 'Read' && <ReadComponent data={usersData} />}
      </div>
    </div>
  );
}

export default App;
