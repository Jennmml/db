import { useState } from 'react';
  import TablaSelector from './TablaSelector.';
import TablaDatos from './TablaDatos';
import ModalConfirmacion from './ModalConfirmacion';

const API_URL = import.meta.env.VITE_API_URL;

const VistaDeTablas = ({
  tablas,
  tablaSeleccionada,
  datosTabla,
  onClickTabla,
  onEliminarLocalmente,
  onActualizarLocalmente, 
}) => {
  const [editandoFila, setEditandoFila] = useState(null);
  const [valoresEditados, setValoresEditados] = useState({});
  const [accion, setAccion] = useState(null);

  const columnas = datosTabla.length > 0 ? Object.keys(datosTabla[0]) : [];

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

      if (onActualizarLocalmente) {
        onActualizarLocalmente(valoresEditados);
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
      if (onEliminarLocalmente) {
        onEliminarLocalmente(editandoFila);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Hubo un problema al eliminar.');
    } finally {
      cancelarEdicion();
      setAccion(null);
    }
  };

  return (
    <div className="p-4">
      <TablaSelector
        tablas={tablas}
        tablaSeleccionada={tablaSeleccionada}
        onClickTabla={onClickTabla}
      />

      {tablaSeleccionada && (
        <>
          {datosTabla.length > 0 ? (
            <TablaDatos
              columnas={columnas}
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
    </div>
  );
};

export default VistaDeTablas;
