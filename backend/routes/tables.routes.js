const express = require('express');
const router = express.Router();
const {
  generarTablas,
  obtenerDatosDeTabla,
  editarDatosDeTabla,
  eliminarDatosDeTabla,
  obtenerEstructuraTabla,
  insertarDatosEnTabla,
  obtenerPermisosTabla,
  obtenerEsquemasDisponibles,
} = require('../controllers/tables.controller');

router.get('/tablas', generarTablas);
router.get('/tablas/:nombreTabla', obtenerDatosDeTabla);
router.put('/editar/:nombreTabla', editarDatosDeTabla);
router.delete('/eliminar/:nombreTabla', eliminarDatosDeTabla);
router.get('/estructura/:nombreTabla', obtenerEstructuraTabla);
router.post('/insertar/:nombreTabla', insertarDatosEnTabla);
router.get('/permisos/:nombreTabla', obtenerPermisosTabla);
router.get('/schemas', obtenerEsquemasDisponibles);

module.exports = router; 