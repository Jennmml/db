const { Client } = require('pg');

let client;

const connect = async (config) => {
  if (client) {
    console.log('⚠️ Ya existe una conexión a PostgreSQL');
    return client;
  }

  client = new Client({
    user: config.user,
    host: config.host,
    database: config.database,
    password: config.password,
    port: 5432, // o el puerto que uses
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');
    return client;
  } catch (err) {
    console.error('❌ Error en PostgreSQL:', err.message);
    throw err;
  }
};

module.exports = { connect };
