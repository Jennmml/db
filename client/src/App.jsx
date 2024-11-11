import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import DeleteComponent from './components/DeleteComponent';
import ReadComponent from './components/ReadComponent';
import CreateComponent from './components/CreateComponent';
import UpdateComponent from './components/UpdateComponent';
import EnterpriseDasboard from './components/DashBoardEmpresarial';

export default function App() {
  const [activeOperation, setActiveOperation] = useState('dashboard');
  const [usersData, setUsersData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedType, setSelectedType] = useState('');

  const loadTotalUsers = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/personas`);
      const result = await response.json();
      setTotalUsers(result.length);
    } catch (error) {
      console.error('Error al obtener el total de usuarios:', error);
    }
  };

  useEffect(() => {
    if (activeOperation === 'dashboard') {
      loadTotalUsers();
    }
  }, [activeOperation]);

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

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold text-gray-800">CRUD App</h2>
        <nav className="mt-6 space-y-2">
          {['dashboard', 'create', 'read', 'update', 'delete','Enterprise-Dashboard'].map((operation) => (
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

      <main className="flex-1 p-8 overflow-y-auto">
        {activeOperation === 'dashboard' && <Dashboard totalUsers={totalUsers} />}
        {activeOperation === 'create' && <CreateComponent />}
        {activeOperation === 'read' && (
          <ReadComponent
            data={usersData}
            selectedType={selectedType}
            handleTypeChange={handleTypeChange}
          />
        )}
        {activeOperation === 'update' && <UpdateComponent />}
        {activeOperation === 'delete' && <DeleteComponent />}
        {activeOperation === 'Enterprise-Dashboard' && <EnterpriseDasboard />}
      </main>
    </div>
  );
}
