const sql = require('mssql');

// Configura los detalles de tu conexión
const config = {
    user: 'jony',  // Usuario de SQL Server
    password: '123',  // Contraseña del usuario
    server: '192.168.0.2',  // Dirección IP o nombre del servidor
    database: 'PERSONAS',  // Nombre de la base de datos
    options: {
        encrypt: false,  // Dependiendo de la configuración de tu servidor
        enableArithAbort: true  // Configuración recomendada por mssql para SQL Server
    }
};

let pool;

// Crear el pool de conexiones al iniciar el servidor
const connect = async () => {
    if (pool) {
        console.log("Ya existe una conexión a SQL Server");
        return pool;
    }
    try {
        pool = await sql.connect(config);
        console.log("Conexión exitosa a SQL Server");
        return pool;
    } catch (err) {
        console.error('Error al conectar a SQL Server:', err);
        throw err;
    }
};

module.exports = { config, connect };