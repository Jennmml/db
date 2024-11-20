const express = require('express');
const { connect } = require('./config/dbConfig');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json()); // Permitir leer datos JSON del body
app.use(cors());

let pool;

// Llamar a la función para inicializar el pool
const initializePool = async () => {
    pool = await connect();
};

initializePool();



//endpoint para obtener todos los clientes
app.get('/api/personas', async (req, res) => {
  try{
    const result = await pool.request().query('SELECT * FROM Personas');
    console.log(result);
    res.json(result.recordset);
  }catch(error){
    console.error('Error al obtener clientes:', error);
    res.status(500).send('Error al obtener clientes');
  }
})


app.get('/api/clientes', async (req, res) => {
    try{
      const result = await pool.request().query('SELECT * FROM Clientes');
      console.log(result);
      res.json(result.recordset);
    }catch(error){
      console.error('Error al obtener clientes:', error);
      res.status(500).send('Error al obtener clientes');
    }
  })



  app.get('/api/colaboradores', async (req, res) => {
    try{
      const result = await pool.request().query('SELECT * FROM Colaboradores');
      console.log(result);
      res.json(result.recordset);
    }catch(error){
      console.error('Error al obtener clientes:', error);
      res.status(500).send('Error al obtener clientes');
    }
  })



  app.get('/api/agentes', async (req, res) => {
    try{
      const result = await pool.request().query('SELECT * FROM Agentes');
      console.log(result);
      res.json(result.recordset);
    }catch(error){
      console.error('Error al obtener clientes:', error);
      res.status(500).send('Error al obtener clientes');
    }
  })


  app.get('/api/roles', async (req, res) => {
    try {
        console.log('Obteniendo roles');
        const result = await pool.request().query('SELECT * FROM Vista_Empleados_Simplificada');
        console.log('Roles obtenidos:', result.recordset);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No se encontraron roles' });
        }

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al obtener roles:', error.message);
        res.status(500).json({ message: 'Error al obtener roles', error: error.message });
    }
});



//Vista de resumen de contratos de empresas
app.get('/api/contratos', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Vista_Resumen_Contratos_Empresa');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error with direct query:', error);
        res.status(500).json({ message: 'Error with direct query', error: error.message });
    }
});


//Vista de resumen de clientes con contratos activos
app.get('/api/clientes_activos', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Vista_Informacion_Contratos_Clientes');
        console.log('Direct query result:', result.recordset);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error with direct query:', error);
        res.status(500).json({ message: 'Error with direct query', error: error.message });
    }
});



app.get('/api/contratos', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Vista_Resumen_Contratos_Empresa');
        console.log('Direct query result:', result.recordset);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error with direct query:', error);
        res.status(500).json({ message: 'Error with direct query', error: error.message });
    }
});


//Endpoint para registrar una persona
  app.post('/api/register', async (req, res) => {
    const { cedula, nombre, apellido_1, apellido_2, genero, direccion } = req.body;

    try {
        // Verifica si todos los campos obligatorios están presentes
        console.log("Iniciando registro de persona");
        
        if (!cedula || !nombre || !apellido_1 || !genero || !direccion) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // Llamada al procedimiento almacenado
        const result = await pool.request()
            .input('cedula', sql.VarChar, cedula)
            .input('nombre', sql.VarChar, nombre)
            .input('apellido1', sql.VarChar, apellido_1)
            .input('apellido2', sql.VarChar, apellido_2 || null)  // Maneja `apellido_2` opcional
            .input('genero', sql.Char, genero)
            .input('direccion', sql.VarChar, direccion)
            .execute('InsertarPersona');  // Ejecuta el procedimiento almacenado

        // Verifica si la inserción fue exitosa
        if (result.rowsAffected[0] > 0) {
            res.status(201).json({ message: 'Persona registrada exitosamente' });
        } else {
            res.status(200).json({ message: 'Error al insertar persona' });
        }
    } catch (err) {
        console.error('Error al registrar persona:', err);
        res.status(500).json({ message: 'Error al registrar persona' });
    }
});




app.delete('/api/borrar/:cedula', async (req, res) => {
    const { cedula } = req.params;

    // Verificar si la cédula es válida
    if (!cedula || cedula.trim() === '') {
        return res.status(400).send('Cédula no válida');
    }

    try {
        // Ejecutar el procedimiento almacenado para borrar la persona
        const result = await pool.request()
            .input('cedula', sql.VarChar, cedula)
            .execute('BorrarPersona');


        // Verificar si se afectó al menos una fila
        const totalRowsAffected = result.rowsAffected.reduce((acc, curr) => acc + curr, 0);

        if (totalRowsAffected > 0) {
            res.status(200).json({ message: 'Persona eliminada exitosamente' });
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (error) {
        console.error('Error al borrar persona:', error);
        res.status(500).json({ message: 'Error al borrar persona', error: error.message });
    }
});



// Endpoint para actualizar la dirección y/o cambiar el estado de un cliente
app.put('/api/update/:cedula', async (req, res) => {
    const { cedula } = req.params;
    const { nueva_direccion, estado } = req.body; // Agregado el estado al body

    try {
        // Verificar si se necesita actualizar la dirección
        if (nueva_direccion) {
            const direccionRequest = pool.request()
                .input('cedula', sql.VarChar, cedula)
                .input('nueva_direccion', sql.VarChar, nueva_direccion);

            // Ejecutar el procedimiento almacenado para actualizar la dirección
            const resultDireccion = await direccionRequest.execute('ActualizarDireccion');
            console.log("Direccion actualizada");
        
        }

        // Verificar si se necesita actualizar el estado (ya sea 'Activo' o 'Inactivo')
        if (estado === 'Inactivo' || estado === 'Activo') {
            const estadoRequest = pool.request()
                .input('cedula', sql.VarChar, cedula)
                .input('estado', sql.VarChar, estado);

            const resultEstado = await estadoRequest.query("UPDATE Clientes SET estado = @estado WHERE cedula = @cedula");
            console.log("Estado actualizado");
        }

        res.status(200).json({ message: 'Actualización completada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la información:', error);
        res.status(500).json({ message: 'Error al actualizar la información', error: error.message });
    }
});




app.get('/', (req, res) => {
    res.send('¡Hola mundo!');
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});