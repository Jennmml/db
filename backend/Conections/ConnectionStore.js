let currentConnection = null;
let currentDbType = null;

function setConnection(connection, dbType) {
  currentConnection = connection;
  currentDbType = dbType;
}

function getConnection() {
  return { connection: currentConnection, dbType: currentDbType };
}

function clearConnection() {
  currentConnection = null;
  currentDbType = null;
}

module.exports = { setConnection, getConnection, clearConnection };
