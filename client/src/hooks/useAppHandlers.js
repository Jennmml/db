import { useState, useRef } from 'react';

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

  
  // 🧠 Mapa de caché en memoria para evitar peticiones repetidas
  const cache = useRef(new Map());


  //Esta función maneja los cambios en los campos del formulario de conexión a la base de datos.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };


  //Esta función maneja el envío del formulario de conexión a la base de datos.
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


  //Esta función maneja el cierre de sesión y la desconexión de la base de datos.
  const handleCerrarSesion = async () => {
    try {
      const res = await fetch(`${API_URL}/desconectar`, {
        method: 'POST',
      });
      const data = await res.json();
      alert(data.message || '🔌 Conexión cerrada');

      // 🧹 Limpiar caché al cerrar sesión
      cache.current.clear();

      setConexionEstablecida(false);
      setTablas([]);
      setTablaSeleccionada(null);
      setDatosTabla([]);
      navigate('/conectar');
    } catch (err) {
      alert('❌ Error al cerrar sesión: ' + err.message);
    }
  };


  //Esta función obtiene las tablas de la base de datos conectada.
  const fetchTablas = async () => {
    const cacheKey = 'tablas';

    // ⚡ Si las tablas están en caché, úsalas
    if (cache.current.has(cacheKey)) {
      console.log('📦 Usando tablas desde caché');
      setTablas(cache.current.get(cacheKey));
      return;
    }

    setTablas([]);
    setTablaSeleccionada(null);
    setDatosTabla([]);
    try {
      const response = await fetch(`${API_URL}/generar-tablas`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      cache.current.set(cacheKey, data.tablas); // Guardar en caché
 
      setTablas(data.tablas);
    } catch (err) {
      alert('❌ Error al obtener tablas: ' + err.message);
    }
  };


  //Esta función maneja el clic en una tabla específica y obtiene sus datos.
  const handleTablaClick = async (nombreTabla) => {
    setTablaSeleccionada(nombreTabla);

    const cacheKey = `tabla-${nombreTabla}`;

    // ⚡ Si los datos de la tabla están en caché, úsalos
    if (cache.current.has(cacheKey)) {
      console.log(`📦 Usando datos cacheados para la tabla ${nombreTabla}`);
      setDatosTabla(cache.current.get(cacheKey));
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tabla/${nombreTabla}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      cache.current.set(cacheKey, data.datos); // Guardar en caché
      console.log(`📦 Usando datos de ${nombreTabla} consultados a la base da datos`);
      
      setDatosTabla(data.datos);
    } catch (err) {
      alert('❌ Error al obtener datos de la tabla: ' + err.message);
      setDatosTabla([]);
    }
  };


  //Esta función maneja la eliminación de una fila de datos de la tabla.
  const handleEliminarFila = (filaEliminada) => {
    const llavePrimaria = Object.keys(filaEliminada)[0];
    setDatosTabla((prev) =>
      prev.filter((fila) => fila[llavePrimaria] !== filaEliminada[llavePrimaria])
    );
  };


  //Esta función maneja la actualización de una fila de datos de la tabla.
  const handleActualizarFila = (filaActualizada) => {
    const pk = Object.keys(filaActualizada)[0];
    setDatosTabla((prev) =>
      prev.map((fila) =>
        fila[pk] === filaActualizada[pk] ? filaActualizada : fila
      )
    );
  };

  



  // Esta función obtiene la estructura de una tabla específica
  const fetchEstructuraTabla = async (nombreTabla) => {
  try {
    const response = await fetch(`${API_URL}/estructura/${nombreTabla}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener estructura');
    }

    return data.columnas;
  } catch (err) {
    console.error(`❌ Error al obtener estructura de "${nombreTabla}":`, err.message);
    throw err; 
  }
};


const insertarDatosEnTabla = async (nombreTabla, datos, preview = false, prefix = null, schema = null) => {
  const url = `${API_URL}/insertar/${nombreTabla}${preview ? '?preview=true' : ''}${prefix ? `&prefix=${encodeURIComponent(prefix)}&schema=${encodeURIComponent(schema)}` : ''}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error('Error al insertar');
  return await res.json();
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
    fetchEstructuraTabla,
    insertarDatosEnTabla,
  };
};
