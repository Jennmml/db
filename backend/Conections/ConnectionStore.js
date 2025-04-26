/**
 * Esto es para poder guardar conexiones globales
 */

let currentConnection = null;
let currentDbType = null;
 
/*
  Métodos de conexiones, 
*/
//Set es para conectarla
function setConnection(connection, dbType) {
  currentConnection = connection;
  currentDbType = dbType;
}

//Get para optenerla 
function getConnection() {
  return { connection: currentConnection, dbType: currentDbType };
}

//Para cerrar la sesión de conexión
function clearConnection() {
  currentConnection = null;
  currentDbType = null;
}

module.exports = { setConnection, getConnection, clearConnection };
