import { useEffect, useState } from "react";

const ClientesActivos = () => {
  const [contractsData, setContractsData] = useState([]);

  useEffect(() => {
    const fetchClientsData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/clientes_activos');
        const data = await response.json();
        setContractsData(data);
      } catch (error) {
        console.error('Error fetching contracts data:', error);
      }
    };

    fetchClientsData();
  }, []);

  return (
    <div className="bg-white shadow-lg p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Clients Overview</h2>

      <div className="bg-white shadow-lg p-6 rounded-lg border-t-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Details</h3>
        <ul className="space-y-3">
          {contractsData.map((contract, index) => (
            <li
              key={index}
              className="bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <div className="text-gray-800">
                <p className="text-gray-900 font-medium">Client: {contract.nombre} {contract.apellido1}</p>
                <p>Cédula: {contract.cedula}</p>
                <p>Company: {contract.empresa_asociada}</p>
                <p>Contract ID: {contract.id_contrato}</p>
                <p>Start Date: {new Date(contract.fecha_creacion).toLocaleDateString()}</p>
                <p>End Date: {new Date(contract.fecha_finalizacion).toLocaleDateString()}</p>
                <p>Status: <span className={`px-2 py-1 rounded-full text-sm font-semibold ${contract.estado_contrato === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {contract.estado_contrato}
                </span></p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClientesActivos;
