const { connect: connectSQL } = require('../Conections/ConectorSqlServer');
const { connect: connectPostgres } = require('../Conections/ConectorPostgre');
const { setConnection, clearConnection  } = require('../Conections/ConnectionStore');


const conectarBaseDatos = async (req, res) => {
  const { dbType, host, username, password, dbname } = req.body;

  console.log("📥 Recibido:", { dbType, host, username, dbname });

  const config = {
    user: username,
    password: password,
    host: host,
    database: dbname,
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
      return res.status(400).json({ success: false, message: 'Tipo de base de datos no soportado' });
    }

    // Guardar conexión activa en memoria
    setConnection(connection, dbType);

    res.json({ success: true, message: '✅ Conexión exitosa' });
  } catch (err) {
    console.error('❌ Error al conectar:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const cerrarConexion = (req, res) => {
    clearConnection();
    console.log("Conexión cerrada y memoria liberada.");
    res.json({ success: true, message: '🔌 Conexión cerrada exitosamente' });
  };


  module.exports = {
    conectarBaseDatos,
    cerrarConexion, 
  };