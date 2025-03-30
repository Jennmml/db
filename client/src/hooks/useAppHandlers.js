import { useState } from 'react';

export const useAppHandlers = ({
  API_URL,
  navigate,
  setConexionEstablecida,
  setTablas,
  setTablaSeleccionada,
  setDatosTabla,
}) => {
  const [form, setForm] = useState({
    dbType: 'Postgre',
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
      const response = await fetch(`${API_URL}/conectar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(data.message);
      setConexionEstablecida(true);
      navigate('/tablas');
    } catch (err) {
      alert('❌ Error al conectar: ' + err.message);
      setConexionEstablecida(false);
    }
  };

  const handleCerrarSesion = async () => {
    try {
      const res = await fetch(`${API_URL}/desconectar`, {
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

  const fetchTablas = async () => {
    setTablas([]);
    setTablaSeleccionada(null);
    setDatosTabla([]);
    try {
      const response = await fetch(`${API_URL}/generar-tablas`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setTablas(data.tablas);
    } catch (err) {
      alert('❌ Error al obtener tablas: ' + err.message);
    }
  };

  const handleTablaClick = async (nombreTabla) => {
    setTablaSeleccionada(nombreTabla);
    try {
      const res = await fetch(`${API_URL}/tabla/${nombreTabla}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDatosTabla(data.datos);
    } catch (err) {
      alert('❌ Error al obtener datos de la tabla: ' + err.message);
      setDatosTabla([]);
    }
  };

  const handleEliminarFila = (filaEliminada) => {
    const llavePrimaria = Object.keys(filaEliminada)[0];
    setDatosTabla((prev) =>
      prev.filter((fila) => fila[llavePrimaria] !== filaEliminada[llavePrimaria])
    );
  };

  const handleActualizarFila = (filaActualizada) => {
    const pk = Object.keys(filaActualizada)[0];
    setDatosTabla((prev) =>
      prev.map((fila) =>
        fila[pk] === filaActualizada[pk] ? filaActualizada : fila
      )
    );
  };

  return {
    form,
    handleChange,
    handleSubmit,
    handleCerrarSesion,
    fetchTablas,
    handleTablaClick,
    handleEliminarFila,
    handleActualizarFila,
  };
};
