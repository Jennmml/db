const express = require('express');
const router = express.Router();
const { conectarBaseDatos, cerrarConexion} = require('../controllers/db.controller');
const { generarTablas, obtenerDatosDeTabla } = require('../controllers/tables.controller');

router.post('/conectar', conectarBaseDatos);
router.post('/desconectar', cerrarConexion);
router.get('/generar-tablas', generarTablas);
router.get('/tabla/:nombreTabla', obtenerDatosDeTabla);

module.exports = router;
