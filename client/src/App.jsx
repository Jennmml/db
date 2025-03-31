import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Conexions from './components/Conexiones/Conexions';
import VistaDeTablas from './components/VistaDeTablas/Tablas';
import Navbar from './components/NavBar/NavBar';
import TablaSelector from './components/VistaDeTablas/TablaSelector';
import TablaDatos from './components/VistaDeTablas/TablaDatos';
import InsertModal from './components/VistaDeTablas/InsertModal';
import ModalConfirmacion from './components/VistaDeTablas/ModalConfirmacion';
import PermisosTabla from './components/VistaDeTablas/PermisosTabla';
import { useAppHandlers } from './hooks/useAppHandlers';

const API_URL = "http://localhost:3000/api";

export default function App() {
  const [conexionEstablecida, setConexionEstablecida] = useState(false);
  const [tablas, setTablas] = useState([]);
  const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
  const [datosTabla, setDatosTabla] = useState([]);
  const [permisosTabla, setPermisosTabla] = useState(null);
  const [columnPermisos, setColumnPermisos] = useState({});

  const [editandoFila, setEditandoFila] = useState(null);
  const [valoresEditados, setValoresEditados] = useState({});
  const [accion, setAccion] = useState(null);
  const [tablaAInsertar, setTablaAInsertar] = useState(null);

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
    fetchEstructuraTabla,
    insertarDatosEnTabla,
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

  const fetchPermisosTabla = async (nombreTabla) => {
    try {
      const response = await fetch(`${API_URL}/permisos/${nombreTabla}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPermisosTabla(data.permisos);
      setColumnPermisos(data.columnPermisos || {});
    } catch (err) {
      console.error('Error al obtener permisos:', err);
      setPermisosTabla(null);
      setColumnPermisos({});
    }
  };

  const handleTablaSeleccionada = async (nombreTabla) => {
    setTablaSeleccionada(nombreTabla);
    await handleTablaClick(nombreTabla);
    await fetchPermisosTabla(nombreTabla);
  };

  const iniciarEdicion = (fila) => {
    setEditandoFila(fila);
    setValoresEditados(fila);
  };

  const cancelarEdicion = () => {
    setEditandoFila(null);
    setValoresEditados({});
  };

  const confirmarEdicion = async () => {
    try {
      const url = `${API_URL}/editar/${tablaSeleccionada}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valoresEditados),
      });

      if (!res.ok) throw new Error('Error al editar');
      alert('✅ Editado correctamente.');

      if (handleActualizarFila) {
        handleActualizarFila(valoresEditados);
      }

      cancelarEdicion();
    } catch (err) {
      console.error(err);
      alert('❌ Hubo un problema al editar.');
    }
  };

  const confirmarEliminacion = async () => {
    try {
      const url = `${API_URL}/eliminar/${tablaSeleccionada}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editandoFila),
      });

      if (!res.ok) throw new Error('Error al eliminar');
      alert('🗑️ Eliminado correctamente.');
      if (handleEliminarFila) {
        handleEliminarFila(editandoFila);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Hubo un problema al eliminar.');
    } finally {
      cancelarEdicion();
      setAccion(null);
    }
  };

  const handleInsertarConRefresco = async (nombreTabla, datos) => {
    await insertarDatosEnTabla(nombreTabla, datos);
    await handleTablaClick(nombreTabla); // refrescar
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
              <VistaDeTablas>
                <TablaSelector
                  tablas={tablas}
                  tablaSeleccionada={tablaSeleccionada}
                  onClickTabla={handleTablaSeleccionada}
                  onInsertar={setTablaAInsertar}
                />

                {tablaSeleccionada && (
                  <>
                    <PermisosTabla permisos={permisosTabla} />
                    
                    {datosTabla.length > 0 ? (
                      <TablaDatos
                        columnas={Object.keys(datosTabla[0])}
                        datos={datosTabla}
                        editandoFila={editandoFila}
                        valoresEditados={valoresEditados}
                        setValoresEditados={setValoresEditados}
                        onEditar={iniciarEdicion}
                        onCancelar={cancelarEdicion}
                        onGuardar={confirmarEdicion}
                        onEliminar={(fila) => {
                          setEditandoFila(fila);
                          setAccion('eliminar');
                        }}
                        columnPermisos={columnPermisos}
                      />
                    ) : (
                      <p className="text-center mt-6 text-gray-500">
                        No hay datos en esta tabla.
                      </p>
                    )}
                  </>
                )}

                {accion === 'eliminar' && editandoFila && (
                  <ModalConfirmacion
                    onConfirmar={confirmarEliminacion}
                    onCancelar={() => {
                      setEditandoFila(null);
                      setAccion(null);
                    }}
                  />
                )}

                {tablaAInsertar && (
                  <InsertModal
                    nombreTabla={tablaAInsertar}
                    onClose={() => setTablaAInsertar(null)}
                    fetchEstructuraTabla={fetchEstructuraTabla}
                    insertarDatosEnTabla={handleInsertarConRefresco}
                  />
                )}
              </VistaDeTablas>
            ) : (
              <Navigate to="/conectar" />
            )
          }
        />
      </Routes>
    </>
  );
}
