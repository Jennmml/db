const ModalConfirmacion = ({ onConfirmar, onCancelar }) => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg text-center">
        <h2 className="text-lg font-semibold mb-4">¿Confirmar eliminación?</h2>
        <p className="text-sm text-gray-600 mb-6">
          Estás a punto de eliminar la fila seleccionada.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onConfirmar}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
  
  export default ModalConfirmacion;
  