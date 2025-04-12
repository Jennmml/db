const express = require('express');

/**
  express.Router() define y maneja las rutas
  Es útil para modularizar y mantener el código ordenado.
 */
const router = express.Router();

//Importando funciones de la conexion
const { conectarBaseDatos, cerrarConexion} = require('../controllers/db.controller');

//Importando los controladores
const { 
    generarTablas,
    obtenerDatosDeTabla,
    editarDatosDeTabla,
    eliminarDatosDeTabla,
    obtenerEstructuraTabla,
    insertarDatosEnTabla,
    obtenerPermisosTabla,
} = require('../controllers/tables.controller');

//Se definen las rutas
router.post('/conectar', conectarBaseDatos);
router.post('/desconectar', cerrarConexion);
router.get('/generar-tablas', generarTablas);
router.get('/tabla/:nombreTabla', obtenerDatosDeTabla);
router.put('/editar/:nombreTabla', editarDatosDeTabla);
router.delete('/eliminar/:nombreTabla', eliminarDatosDeTabla);
router.get('/estructura/:nombreTabla', obtenerEstructuraTabla);
router.post('/insertar/:nombreTabla', insertarDatosEnTabla);
router.get('/permisos/:nombreTabla', obtenerPermisosTabla);

module.exports = router;