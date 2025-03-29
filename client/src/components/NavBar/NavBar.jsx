import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ conexionEstablecida, onCerrarSesion }) => {
  const location = useLocation();

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <div className="flex gap-6">
        <Link
          to="/conectar"
          className={`hover:text-blue-400 transition ${
            location.pathname === '/conectar' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Conectar
        </Link>

        {conexionEstablecida && (
          <Link
            to="/tablas"
            className={`hover:text-blue-400 transition ${
              location.pathname === '/tablas' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Tablas
          </Link>
        )}
      </div>

      {conexionEstablecida && (
        <button
          onClick={onCerrarSesion}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium shadow transition"
        >
          🔌 Cerrar sesión
        </button>
      )}
    </nav>
  );
};

export default Navbar;
