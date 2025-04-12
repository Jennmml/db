import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

const StoredProcedureDialog = ({ isOpen, onClose, onConfirm, title, operationType, API_URL }) => {
  const [prefix, setPrefix] = useState('');
  const [selectedSchema, setSelectedSchema] = useState('');
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSchemas();
    }
  }, [isOpen]);

  const fetchSchemas = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching schemas from:', `${API_URL}/schemas`);
      const response = await fetch(`${API_URL}/schemas`);
      if (!response.ok) {
        throw new Error('Error al obtener los esquemas');
      }
      const data = await response.json();
      console.log('Raw schema data:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener los esquemas');
      }

      if (!data.schemas || data.schemas.length === 0) {
        throw new Error('No se encontraron esquemas disponibles');
      }

      console.log('Available schemas:', data.schemas);
      // Map the schemas to get just the schema names
      const schemaList = data.schemas.map(s => s.schema_name);
      console.log('Processed schema list:', schemaList);
      setSchemas(schemaList);
      
      // Set public as default schema, or dbo for SQL Server
      const defaultSchema = schemaList.find(s => s === 'public') || schemaList.find(s => s === 'dbo') || schemaList[0];
      console.log('Selected default schema:', defaultSchema);
      setSelectedSchema(defaultSchema);
    } catch (error) {
      console.error('Error fetching schemas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prefix.trim()) {
      setError('Por favor, ingrese un prefijo para el procedimiento almacenado');
      return;
    }
    if (!selectedSchema) {
      setError('Por favor seleccione un esquema');
      return;
    }
    onConfirm(prefix, selectedSchema, operationType);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <p className="text-sm text-gray-600 mb-4">
          Configure el procedimiento almacenado para esta tabla. Esta configuración se guardará y se reutilizará para futuras operaciones en la misma tabla.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Prefijo del procedimiento
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Ej: miTabla"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Esquema
            </label>
            <select
              value={selectedSchema}
              onChange={(e) => setSelectedSchema(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={loading}
            >
              {loading ? (
                <option>Cargando esquemas...</option>
              ) : schemas.length === 0 ? (
                <option>No hay esquemas disponibles</option>
              ) : (
                schemas.map((schema) => (
                  <option key={schema} value={schema}>
                    {schema}
                  </option>
                ))
              )}
            </select>
          </div>
          {error && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Confirmar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StoredProcedureDialog; 