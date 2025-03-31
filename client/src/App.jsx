import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Conexions from './components/Conexiones/Conexions';
import VistaDeTablas from './components/VistaDeTablas/Tablas';
import Navbar from './components/NavBar/NavBar';
import { useAppHandlers } from './hooks/useAppHandlers';

const API_URL = "http://localhost:3000/api"

export default function App() {
  const [conexionEstablecida, setConexionEstablecida] = useState(false);
  const [tablas, setTablas] = useState([]);
  const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
  const [datosTabla, setDatosTabla] = useState([]);

  const navigate = useNavigate();

  const {
    form,
    handleChange,
    handleSubmit,
    handleCerrarSesion,
    fetchTablas,
    handleTablaClick,
    handleEliminarFila,
    handleActualizarFila,
  } = useAppHandlers({
    API_URL,
    navigate,
    setConexionEstablecida,
    setTablas,
    setTablaSeleccionada,
    setDatosTabla,
  });

  useEffect(() => {
    if (conexionEstablecida) {
      fetchTablas();
    }
  }, [conexionEstablecida]);

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
                onEliminarLocalmente={handleEliminarFila}
                onActualizarLocalmente={handleActualizarFila}
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
