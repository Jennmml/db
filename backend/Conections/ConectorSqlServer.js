const sql = require('mssql');

const connect = async (config) => {
  const finalConfig = {
    user: config.user,
    password: config.password,
    server: config.host,
    database: config.database,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      port: 1433,
    },
  };

  try {
    const pool = await sql.connect(finalConfig);
    console.log('✅ Conexión exitosa a SQL Server');
    return pool;
  } catch (err) {
    console.error('❌ Error en SQL Server:', err.message);
    throw err;
  }
};

module.exports = { connect };
