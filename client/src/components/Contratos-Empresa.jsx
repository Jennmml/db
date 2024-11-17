import { useEffect, useState } from "react";

const ResumenContrato = () => {
  const [contractsData, setContractsData] = useState([]);

  useEffect(() => {
    const fetchContractsData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/contratos');
        
        const data = await response.json();
        console.log('Contracts data:', data);
        
        setContractsData(data);
      } catch (error) {
        console.error('Error fetching contracts data:', error);
      }
    };

    fetchContractsData();
  }, []);

  return (
    <div className="bg-white shadow-lg p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Contracts Summary by Company</h2>

      <div className="bg-white shadow-lg p-6 rounded-lg border-t-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Contracts Overview</h3>
        <ul className="space-y-3">
          {contractsData.map((company, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <div>
                <p className="text-gray-900 font-medium">{company.empresa_asociada}</p>
                <p className="text-gray-600 text-sm">Total Contracts: {company.total_contratos}</p>
              </div>
              <div className="flex space-x-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Active: {company.contratos_activos}
                </span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Inactive: {company.contratos_inactivos}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResumenContrato;
