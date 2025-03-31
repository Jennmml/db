import React, { useEffect, useState } from 'react';


const InsertModal = ({ nombreTabla, onClose, fetchEstructuraTabla, insertarDatosEnTabla }) => {
  const [estructura, setEstructura] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEstructura = async () => {
      try {
        const columnas = await fetchEstructuraTabla(nombreTabla);
        setEstructura(columnas);

        const initialForm = {};
        columnas.forEach((col) => {
          if (!col.valorDefecto && col.esPrimaria !== true) {
            initialForm[col.nombre] = '';
          }
        });
        setForm(initialForm);
      } catch (err) {
        alert('❌ Error al obtener estructura: ' + err.message);
      }
    };

    fetchEstructura();
  }, [nombreTabla, fetchEstructuraTabla]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInsertar = async () => {
    setLoading(true);
    console.log('Insertando datos:', form); // ✅
    await insertarDatosEnTabla(nombreTabla, form); // ✅
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Insertar en: {nombreTabla}</h2>

        {estructura.length === 0 ? (
          <p>Cargando estructura...</p>
        ) : (
          <form className="space-y-3">
            {estructura
              .filter((col) => !col.valorDefecto && col.esPrimaria !== true)
              .map((col) => (
                <div key={col.nombre}>
                  <label className="block font-medium">{col.nombre}</label>
                  <input
                    name={col.nombre}
                    value={form[col.nombre] || ''}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    type="text"
                  />
                </div>
              ))}
          </form>
        )}

        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleInsertar}
            disabled={loading}
          >
            {loading ? 'Insertando...' : 'Insertar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsertModal;
