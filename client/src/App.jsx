import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Conexions from './components/Conexiones/Conexions';
import VistaDeTablas from './components/Conexiones/Tablas';
import Navbar from './components/NavBar/NavBar';

export default function App() {
  const [form, setForm] = useState({
    dbType: 'SQL',
    host: '',
    username: '',
    password: '',
    dbname: '',
  });

  const [conexionEstablecida, setConexionEstablecida] = useState(false);
  const [tablas, setTablas] = useState([]);
  const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
  const [datosTabla, setDatosTabla] = useState([]);

  const navigate = useNavigate();


  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(data.message);
      setConexionEstablecida(true);
      navigate('/tablas'); // 👉 Redirigir a vista de tablas
    } catch (err) {
      alert('❌ Error al conectar: ' + err.message);
      setConexionEstablecida(false);
    }
  };

  const handleCerrarSesion = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/desconectar', {
        method: 'POST',
      });
      const data = await res.json();
      alert(data.message || '🔌 Conexión cerrada');

      setConexionEstablecida(false);
      setTablas([]);
      setTablaSeleccionada(null);
      setDatosTabla([]);
      navigate('/conectar');
    } catch (err) {
      alert('❌ Error al cerrar sesión: ' + err.message);
    }
  };

  useEffect(() => {
    const fetchTablas = async () => {
      setTablas([]);
      setTablaSeleccionada(null);
      setDatosTabla([]);

      try {
        const response = await fetch('http://localhost:3000/api/generar-tablas');
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setTablas(data.tablas);
      } catch (err) {
        alert('❌ Error al obtener tablas: ' + err.message);
      }
    };

    if (conexionEstablecida) {
      fetchTablas();
    }
  }, [conexionEstablecida]);

  const handleTablaClick = async (nombreTabla) => {
    setTablaSeleccionada(nombreTabla);

    try {
      const res = await fetch(`http://localhost:3000/api/tabla/${nombreTabla}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDatosTabla(data.datos);
    } catch (err) {
      alert('❌ Error al obtener datos de la tabla: ' + err.message);
      setDatosTabla([]);
    }
  };

  return (
    <>
      <Navbar
        conexionEstablecida={conexionEstablecida}
        onCerrarSesion={handleCerrarSesion}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/conectar" />} />

        <Route
          path="/conectar"
          element={
            <Conexions
              form={form}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              conexionEstablecida={conexionEstablecida}
            />
          }
        />

        <Route
          path="/tablas"
          element={
            conexionEstablecida ? (
                <VistaDeTablas
                  tablas={tablas}
                  tablaSeleccionada={tablaSeleccionada}
                  datosTabla={datosTabla}
                  onClickTabla={handleTablaClick}
                />
            ) : (
              <Navigate to="/conectar" />
            )
          }
        />
      </Routes>
    </>
  );
}
