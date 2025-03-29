import { Link } from 'react-router-dom';

const Navbar = ({ conexionEstablecida, setConexionEstablecida }) =>{
  const cerrarSesion = async () => {
    await fetch('http://localhost:3000/api/desconectar', { method: 'POST' });
    setConexionEstablecida(false);
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex gap-4">
        <Link to="/conectar" className="hover:text-blue-300 transition">Conectar</Link>
        {conexionEstablecida && (
          <Link to="/tablas" className="hover:text-blue-300 transition">Tablas</Link>
        )}
      </div>

      {conexionEstablecida && (
        <button
          onClick={cerrarSesion}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
        >
          Cerrar sesión
        </button>
      )}
    </nav>
  );
}

export default Navbar;