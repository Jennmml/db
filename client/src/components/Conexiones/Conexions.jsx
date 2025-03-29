import { useState } from 'react';

const Conexions = () => {
    const [form, setForm] = useState({
      dbType: 'SQL',
      host: '',
      username: '',
      password: '',
      dbname: '',
    });
  
    const handleChange = (e) => {
      setForm({ ...form, [e.target.id]: e.target.value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('http://localhost:3000/api/conectar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || 'Error desconocido JAJAJA');
        }
  
        alert(data.message);
      } catch (err) {
        alert('❌ Error al conectar: ' + err.message);
      }
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Gestor de Conexión de la Base de Datos
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <div className="flex flex-col">
          <label htmlFor="dbType" className="mb-1 font-medium">
            Tipo de base de datos:
          </label>
          <select id="dbType" value={form.dbType} onChange={handleChange} className="p-2 border rounded">
            <option value="Postgre">PostgreSQL</option>
            <option value="SQL">SQL Server</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="host">Host / IP:</label>
          <input id="host" type="text" value={form.host} onChange={handleChange} placeholder="127.0.0.1" className="p-2 border rounded" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="username">Usuario:</label>
          <input id="username" type="text" value={form.username} onChange={handleChange} placeholder="admin" className="p-2 border rounded" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password">Contraseña:</label>
          <input id="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="p-2 border rounded" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="dbname">Nombre de la base de datos:</label>
          <input id="dbname" type="text" value={form.dbname} onChange={handleChange} placeholder="mi_base_datos" className="p-2 border rounded" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Conectar
        </button>
      </form>
    </div>
  );
};

export default Conexions;
