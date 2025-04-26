//DE ESTA FORMA SE CONFIGURA EL SERVIDOR

//Importando express
const express = require('express');

/**
 * CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad implementado 
 * por los navegadores web para restringir o permitir solicitudes HTTP 
 * entre diferentes dominios
 */
const cors = require('cors');

//Esto es para poder usar las rutas que se definieron en db.routes
const dbRoutes = require('./routes/db.routes');
const tablesRoutes = require('./routes/tables.routes');

//Creando una instancia de el framework Express
const app = express();

//El puerto en el que estamos accediendo a los datos
const port = 3000;

//MiddleWare para parsear el texto plano a JSON
app.use(express.json());

//MiddleWare de cors para poder hacer solicitudes de un dominio a otro
app.use(cors());

/*
Se define la ruta base de las rutas '/api' para acceder a las rutas
Ejemplo http://localhost:3000/api/generar-tablas, pero si la ruta base fuera "/pera"
Se accederia como http://localhost:3000/pera/generar-tablas
Es una mala practica no hacerlo
*/
app.use('/api', dbRoutes);
app.use('/api', tablesRoutes);

//Pagina principal (http://localhost:3000)
app.get('/', (req, res) => {
  res.send('🚀 API de conexión a bases de datos funcionando.');
});

//Es para que la app use este puerto (3000)
app.listen(port, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${port}`);
});