const { Client } = require('pg');

const connect = async (config) => {
  const client = new Client({
    user: config.user,
    host: config.host,
    database: config.database,
    password: config.password,
    port: 5432,
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
