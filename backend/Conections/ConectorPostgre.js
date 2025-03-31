const { Client } = require('pg');

const connect = async (config) => {
  console.log('Attempting to connect with config:', {
    user: config.user,
    host: config.host,
    database: config.database,
    port: 5432
  });

  const client = new Client({
    user: config.user,
    host: config.host,
    database: config.database,
    password: config.password,
    port: 5432,
    ssl: {
      rejectUnauthorized: false // Required for Supabase connections
    }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');
    return client;
  } catch (err) {
    console.error('❌ Error en PostgreSQL:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    throw err;
  }
};

module.exports = { connect };
