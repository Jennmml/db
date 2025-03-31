import React, { useEffect, useState } from 'react';

const InsertModal = ({ nombreTabla, onClose, fetchEstructuraTabla, insertarDatosEnTabla }) => {
  const [estructura, setEstructura] = useState([]);
  const [formDeDatos, setFormDeDatos] = useState({});
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
        setFormDeDatos(initialForm);
      } catch (err) {
        alert('❌ Error al obtener estructura: ' + err.message);
      }
    };

    fetchEstructura();
  }, [nombreTabla, fetchEstructuraTabla]);

  const handleChange = (e) => {
    setFormDeDatos({ ...formDeDatos, [e.target.name]: e.target.value });
  };

  const handleInsertar = async (e) => {
    e.preventDefault(); // evitar recarga
    setLoading(true);
    await insertarDatosEnTabla(nombreTabla, formDeDatos);
    setLoading(false);
    onClose();
  };

  const camposSinAuto = estructura.filter(
    (col) => !col.valorDefecto && col.esPrimaria !== true
  );

  const usarDosColumnas = camposSinAuto.length > 6;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-lg font-bold mb-4">Insertar en: {nombreTabla}</h2>

        {estructura.length === 0 ? (
          <p>Cargando estructura...</p>
        ) : (
          <form onSubmit={handleInsertar} className={`grid gap-4 ${usarDosColumnas ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {camposSinAuto.map((col) => (
              <div key={col.nombre}>
                <label className="block font-medium">{col.nombre}</label>
                <input
                  name={col.nombre}
                  value={formDeDatos[col.nombre] || ''}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  type="text"
                />
              </div>
            ))}

            <div className="col-span-full flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Insertando...' : 'Insertar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InsertModal;
