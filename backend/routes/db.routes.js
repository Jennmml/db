const express = require('express');
const router = express.Router();
const { conectarBaseDatos, cerrarConexion} = require('../controllers/db.controller');
const { 
    generarTablas,
     obtenerDatosDeTabla,
      editarDatosDeTabla,
    eliminarDatosDeTabla,
     } = require('../controllers/tables.controller');

router.post('/conectar', conectarBaseDatos);
router.post('/desconectar', cerrarConexion);
router.get('/generar-tablas', generarTablas);
router.get('/tabla/:nombreTabla', obtenerDatosDeTabla);
router.put('/editar/:nombreTabla', editarDatosDeTabla);
router.delete('/eliminar/:nombreTabla', eliminarDatosDeTabla);


module.exports = router;
