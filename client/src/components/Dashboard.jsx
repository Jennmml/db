import { useEffect, useState } from "react";

const Dashboard = () => {
  const [combinedData, setCombinedData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseRoles = await fetch('http://localhost:3000/api/roles');
        const responsePersons = await fetch('http://localhost:3000/api/personas');

        const rolesData = await responseRoles.json();
        const personsData = await responsePersons.json();

        setTotalUsers(personsData.length);

        // Combinar los datos de personas con los roles
        const combined = personsData.map((person) => {
          const role = rolesData.find((r) => r.cedula === person.cedula);
          return {
            ...person,
            rol: role ? role.rol : 'Persona', // Asignar "Persona" si no hay rol encontrado
          };
        });

        setCombinedData(combined);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white shadow-lg p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Total Users: {totalUsers}</h2>

      <div className="bg-white shadow-lg p-6 rounded-lg border-t-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Roles</h3>
        <ul className="space-y-3">
          {combinedData.map((person, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <div>
                <p className="text-gray-900 font-medium">{person.nombre} {person.apellido1}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {person.rol}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
