import { useState } from 'react';
import Dashboard from './components/Dashboard';
import CudComponent from './components/CudComponent';
import ReadComponent from './components/ReadComponent';

export default function App() {
  const [activeOperation, setActiveOperation] = useState('dashboard');
  const [usersData, setUsersData] = useState([]);
  const [selectedType, setSelectedType] = useState(''); // Estado para la opción seleccionada

  const handleTypeChange = async (e) => {
    const type = e.target.value;
    setSelectedType(type);

    if (type) {
      try {
        const response = await fetch(`http://localhost:3000/api/${type}`);
        const result = await response.json();
        setUsersData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  const handleCreate = (name, age) => {
    const newUser = { id: usersData.length + 1, name, age: parseInt(age) };
    setUsersData([...usersData, newUser]);
    return true;
  };

  const handleUpdate = (id, age) => {
    const updatedUsers = usersData.map((user) =>
      user.id === parseInt(id) ? { ...user, age: parseInt(age) } : user
    );
    setUsersData(updatedUsers);
    return true;
  };

  const handleDelete = (id) => {
    const filteredUsers = usersData.filter((user) => user.id !== parseInt(id));
    setUsersData(filteredUsers);
    return true;
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold text-gray-800">CRUD App</h2>
        <nav className="mt-6 space-y-2">
          {['dashboard', 'create', 'read', 'update', 'delete'].map((operation) => (
            <button
              key={operation}
              className={`w-full text-left px-4 py-2 rounded ${
                activeOperation === operation
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setActiveOperation(operation)}
            >
              {operation.charAt(0).toUpperCase() + operation.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {activeOperation === 'dashboard' && <Dashboard usersData={usersData} />}
        {activeOperation === 'create' && <CudComponent operation="Create" handleAction={handleCreate} />}
        {activeOperation === 'read' && (
          <ReadComponent
            data={usersData}
            selectedType={selectedType}
            handleTypeChange={handleTypeChange}
          />
        )}
        {activeOperation === 'update' && <CudComponent operation="Update" handleAction={handleUpdate} />}
        {activeOperation === 'delete' && <CudComponent operation="Delete" handleAction={handleDelete} />}
      </main>
    </div>
  );
}
