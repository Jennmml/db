const Conexions = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Gestor de Conexión de la Base de Datos
        </h1>
  
        <form className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
          <div className="flex flex-col">
            <label htmlFor="dbType" className="mb-1 font-medium">
              Tipo de base de datos:
            </label>
            <select
              id="dbType"
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Postgre">PostgreSQL</option>
              <option value="SQL">SQL Server</option>
            </select>
          </div>
  
          <div className="flex flex-col">
            <label htmlFor="host" className="mb-1 font-medium">
              Host / Dirección IP:
            </label>
            <input
              type="text"
              id="host"
              placeholder="127.0.0.1"
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
  
          <div className="flex flex-col">
            <label htmlFor="username" className="mb-1 font-medium">
              Nombre de usuario:
            </label>
            <input
              type="text"
              id="username"
              placeholder="ej. admin"
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
  
          <div className="flex flex-col">
            <label htmlFor="password" className="mb-1 font-medium">
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
  
          <div className="flex flex-col">
            <label htmlFor="dbname" className="mb-1 font-medium">
              Nombre de la base de datos:
            </label>
            <input
              type="text"
              id="dbname"
              placeholder="mi_base_datos"
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
  
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Conectar
          </button>
        </form>
      </div>
    );
  };
  
  export default Conexions;
  