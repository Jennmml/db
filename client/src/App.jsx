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
import StoredProcedureDialog from './components/VistaDeTablas/StoredProcedureDialog';

const API_URL = "http://localhost:3000/api";

export default function App() {
  const [conexionEstablecida, setConexionEstablecida] = useState(false);
  const [tablas, setTablas] = useState([]);
  const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
  const [datosTabla, setDatosTabla] = useState([]);
  const [permisosTabla, setPermisosTabla] = useState(null);
  const [columnPermisos, setColumnPermisos] = useState({});
  const [previewQuery, setPreviewQuery] = useState('');

  const [editandoFila, setEditandoFila] = useState(null);
  const [valoresEditados, setValoresEditados] = useState({});
  const [accion, setAccion] = useState(null);
  const [tablaAInsertar, setTablaAInsertar] = useState(null);
  const [modo, setModo] = useState('execute');

  const [showProcedureDialog, setShowProcedureDialog] = useState(false);
  const [pendingOperation, setPendingOperation] = useState(null);
  const [pendingData, setPendingData] = useState(null);

  const [tableProcedures, setTableProcedures] = useState({});

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
    try {
      setTablaSeleccionada(nombreTabla);
      const response = await fetch(`${API_URL}/tablas/${nombreTabla}`);
      const data = await response.json();
      
      if (data.success) {
        // Ordenar los datos por la primera columna (asumiendo que es la clave primaria)
        const sortedData = data.datos.sort((a, b) => {
          const firstColumn = Object.keys(a)[0];
          const valueA = a[firstColumn];
          const valueB = b[firstColumn];
          
          // Si son números, ordenar numéricamente
          if (!isNaN(valueA) && !isNaN(valueB)) {
            return Number(valueA) - Number(valueB);
          }
          // Si son strings, ordenar alfabéticamente
          return String(valueA).localeCompare(String(valueB));
        });
        
        setDatosTabla(sortedData);
      } else {
        console.error('Error al obtener datos:', data.message);
        setDatosTabla([]);
      }
      
      await fetchPermisosTabla(nombreTabla);
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setDatosTabla([]);
    }
  };

  const iniciarEdicion = (fila) => {
    setEditandoFila(fila);
    setValoresEditados(fila);
  };

  const cancelarEdicion = () => {
    setEditandoFila(null);
    setValoresEditados({});
  };

  const handleInsert = async (datos) => {
    try {
      setPendingData({ nombreTabla: tablaSeleccionada, datos });
      setPendingOperation('insert');
      
      // Check if we already have a stored procedure for this table
      if (tableProcedures[tablaSeleccionada]) {
        // Use existing procedure
        await handleProcedureConfirm(
          tableProcedures[tablaSeleccionada].prefix,
          tableProcedures[tablaSeleccionada].schema,
          'INSERT'
        );
      } else {
        // Show dialog only for first time
        setShowProcedureDialog(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const handleProcedureConfirm = async (prefix, schema, operationType) => {
    try {
      let url;
      let method;
      let body;

      // Construir la URL base
      const baseUrl = `${API_URL}`;
      // Construir los query params
      const queryParams = new URLSearchParams();
      if (modo === 'preview') {
        queryParams.append('preview', 'true');
      } else {
        // Only store procedures in execute mode
        setTableProcedures(prev => ({
          ...prev,
          [pendingData?.nombreTabla || tablaSeleccionada]: {
            prefix,
            schema,
            operationType
          }
        }));

        // Only add procedure params in execute mode
        if (prefix) {
          queryParams.append('prefix', prefix);
          queryParams.append('schema', schema);
          queryParams.append('operationType', operationType);
        }
      }

      switch (pendingOperation) {
        case 'edit':
          url = `${baseUrl}/editar/${tablaSeleccionada}`;
          method = 'PUT';
          body = valoresEditados;
          break;
        case 'delete':
          url = `${baseUrl}/eliminar/${tablaSeleccionada}`;
          method = 'DELETE';
          body = editandoFila;
          break;
        case 'insert':
          url = `${baseUrl}/insertar/${pendingData.nombreTabla}`;
          method = 'POST';
          body = pendingData.datos;
          break;
      }

      // Añadir query params a la URL si existen
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }

      console.log('🔄 Enviando solicitud:', { url, method, body });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error en la operación');
      }
      
      const data = await res.json();
      console.log('📦 Respuesta recibida:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Error en la operación');
      }

      // Limpiar el estado del diálogo
      setShowProcedureDialog(false);
      setPendingOperation(null);
      setPendingData(null);
      
      if (modo === 'preview') {
        // En modo preview, mostrar la creación del stored procedure y cómo ejecutarlo
        let procedureCreation = '';
        let procedureExecution = '';
        
        // Convert operation type for procedure name
        const procName = pendingOperation === 'edit' ? 'update' : operationType.toLowerCase();
        
        if (pendingOperation === 'delete') {
          procedureCreation = `-- Correr esta parte antes de llamar el metodo
CREATE OR REPLACE PROCEDURE ${schema}.${prefix}_${procName}()
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
  ${data.queries.deleteQuery};
END;
$BODY$;`;

          procedureExecution = `-- Para ejecutar el procedimiento:
CALL ${schema}.${prefix}_${procName}();`;
        } else {
          procedureCreation = `-- Correr esta parte antes de llamar el metodo
CREATE OR REPLACE PROCEDURE ${schema}.${prefix}_${procName}()
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
  ${data.query};
END;
$BODY$;`;

          procedureExecution = `-- Para ejecutar el procedimiento:
CALL ${schema}.${prefix}_${procName}();`;
        }

        setPreviewQuery(procedureCreation + '\n\n' + procedureExecution);
        
        // Limpiar estados de edición en preview mode también
        cancelarEdicion();
        setAccion(null);
      } else {
        // En modo execute, refrescar los datos y mostrar confirmación
        const targetTable = pendingOperation === 'insert' ? pendingData.nombreTabla : tablaSeleccionada;
        
        // Limpiar estados de edición
        cancelarEdicion();
        setAccion(null);

        // Refrescar datos inmediatamente
        await handleTablaSeleccionada(targetTable);
        
        // Mostrar confirmación después del refresco
        alert('✅ Operación realizada con éxito');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const handleEdit = async (valoresEditados) => {
    try {
      setValoresEditados(valoresEditados);
      setPendingOperation('edit');
      
      // Check if we already have a stored procedure for this table
      if (tableProcedures[tablaSeleccionada]) {
        // Use existing procedure
        await handleProcedureConfirm(
          tableProcedures[tablaSeleccionada].prefix,
          tableProcedures[tablaSeleccionada].schema,
          'UPDATE'
        );
      } else {
        // Show dialog only for first time
        setShowProcedureDialog(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (fila) => {
    try {
      setEditandoFila(fila);
      setPendingOperation('delete');
      
      // Check if we already have a stored procedure for this table
      if (tableProcedures[tablaSeleccionada]) {
        // Use existing procedure
        await handleProcedureConfirm(
          tableProcedures[tablaSeleccionada].prefix,
          tableProcedures[tablaSeleccionada].schema,
          'DELETE'
        );
      } else {
        // Show dialog only for first time
        setShowProcedureDialog(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const confirmarEdicion = async () => {
    setPendingOperation('edit');
    setShowProcedureDialog(true);
  };

  const confirmarEliminacion = async () => {
    setPendingOperation('delete');
    setShowProcedureDialog(true);
  };

  const handleInsertarConRefresco = async (nombreTabla, datos) => {
    setPendingOperation('insert');
    setPendingData({ nombreTabla, datos });
    setShowProcedureDialog(true);
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
                          setPendingOperation('delete');
                          setShowProcedureDialog(true);
                        }}
                        columnPermisos={columnPermisos}
                        modo={modo}
                        setModo={setModo}
                        previewQuery={previewQuery}
                        setPreviewQuery={setPreviewQuery}
                      />
                    ) : (
                      <p className="text-center mt-6 text-gray-500">
                        No hay datos en esta tabla.
                      </p>
                    )}
                  </>
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

      <StoredProcedureDialog
        isOpen={showProcedureDialog}
        onClose={() => {
          setShowProcedureDialog(false);
          setPendingOperation(null);
          setPendingData(null);
          setPreviewQuery('');
        }}
        onConfirm={handleProcedureConfirm}
        title={
          pendingOperation === 'edit' ? 'Crear procedimiento almacenado para edición' :
          pendingOperation === 'delete' ? 'Crear procedimientos almacenados para eliminación' :
          'Crear procedimiento almacenado para inserción'
        }
        operationType={pendingOperation?.toUpperCase()}
        API_URL={API_URL}
      />
    </>
  );
}
