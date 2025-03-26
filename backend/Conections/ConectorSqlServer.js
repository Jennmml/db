const sql = require('mssql');

let pool;

const connect = async (config) => {
  if (pool) {
    console.log("⚠️ Ya existe una conexión a SQL Server");
    return pool;
  }

  const finalConfig = {
    user: config.user,
    password: config.password,
    server: config.host,
    database: config.database,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      port: 1433, // o el que estés usando
    },
  };

  try {
    pool = await sql.connect(finalConfig);
    console.log("✅ Conexión exitosa a SQL Server");
    return pool;
  } catch (err) {
    console.error("❌ Error en SQL Server:", err.message);
    throw err;
  }
};

module.exports = { connect };
