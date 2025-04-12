const { Client } = require('pg');

const connect = async (config) => {
  console.log('📝 Attempting to connect with config:', {
    user: config.user,
    host: config.host,
    database: config.database,
    port: config.port || 5432
  });

  const clientConfig = {
    user: config.user,
    host: config.host,
    database: config.database,
    password: config.password,
    port: config.port || 5432,
    ssl: false  // Explicitly disable SSL by default
  };

  // Only enable SSL for Supabase or other remote connections
  if (config.host.endsWith('.supabase.co')) {
    clientConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  console.log('🔧 Using connection config:', {
    ...clientConfig,
    password: '***' // Hide password in logs
  });

  try {
    const client = new Client(clientConfig);
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
    
    // Enhance error message for common issues
    let errorMessage = err.message;
    if (err.code === 'ECONNREFUSED') {
      errorMessage = 'No se pudo conectar al servidor PostgreSQL. Verifique que:\n' +
        '1. El servidor PostgreSQL esté corriendo\n' +
        '2. El host y puerto sean correctos\n' +
        '3. No haya un firewall bloqueando la conexión';
    } else if (err.code === '28P01') {
      errorMessage = 'Credenciales inválidas. Verifique su usuario y contraseña.';
    } else if (err.code === '3D000') {
      errorMessage = 'Base de datos no existe. Verifique el nombre de la base de datos.';
    }
    
    throw new Error(errorMessage);
  }
};

module.exports = { connect };
