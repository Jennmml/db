const { connect: connectSQL } = require('../Conections/ConectorSqlServer');
const { connect: connectPostgres } = require('../Conections/ConectorPostgre');
const { setConnection, clearConnection  } = require('../Conections/ConnectionStore');

const conectarBaseDatos = async (req, res) => {
  const { dbType, host, username, password, dbname } = req.body;

  // Validate required fields
  if (!dbType || !host || !username || !password || !dbname) {
    return res.status(400).json({ 
      success: false, 
      message: '❌ Faltan campos requeridos. Se necesita: tipo de base de datos, host, usuario, contraseña y nombre de base de datos' 
    });
  }

  console.log("📥 Recibido:", { 
    dbType, 
    host, 
    username, 
    dbname,
    password: '***' // Hide password in logs
  });

  const config = {
    user: username,
    password: password,
    host: host,
    database: dbname,
    port: 5432 // Default PostgreSQL port
  };

  try {
    clearConnection(); 
    let connection;

    if (dbType === 'SQL') {
      console.log("🔌 Conectando a SQL Server...");
      connection = await connectSQL(config);
    } else if (dbType === 'Postgre') {
      console.log("🔌 Conectando a PostgreSQL...");
      connection = await connectPostgres(config);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: '❌ Tipo de base de datos no soportado. Use "SQL" o "Postgre"' 
      });
    }

    // Guardar conexión activa en memoria
    setConnection(connection, dbType);

    res.json({ success: true, message: '✅ Conexión exitosa' });
  } catch (err) {
    console.error('❌ Error al conectar:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message,
      details: {
        code: err.code,
        hint: err.hint
      }
    });
  }
};

const cerrarConexion = (req, res) => {
  try {
    clearConnection();
    console.log("🔌 Conexión cerrada y memoria liberada.");
    res.json({ success: true, message: '✅ Conexión cerrada exitosamente' });
  } catch (err) {
    console.error('❌ Error al cerrar conexión:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cerrar la conexión: ' + err.message 
    });
  }
};

module.exports = {
  conectarBaseDatos,
  cerrarConexion, 
};