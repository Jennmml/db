const sql = require('mssql');


const config = {
    user: 'jony',  
    password: '123',  
    server: 'JONATHAN//SQLEXPRESS',  
    database: 'master',  
    options: {
        encrypt: false,  
        enableArithAbort: true 
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