const express = require('express');
const { connect } = require('./config/dbConfig');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const saltRounds = 10; // La cantidad de rondas de encriptación
const secretKey = 'claveJony'; // Cambia esto a una clave secreta más segura

app.use(express.json()); // Permitir leer datos JSON del body
app.use(cors());

let pool;

// Llamar a la función para inicializar el pool
const initializePool = async () => {
    pool = await connect();
};

initializePool();

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).send('Se requiere un token');
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).send('Token no válido');
        }
        req.userId = decoded.id; // Guarda el id del usuario en la request
        next();
    });
};
//Hola

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

        // Mostrar el resultado en la consola para depuración
        console.log('Resultado de la operación:', result);

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


// Endpoint para actualizar la dirección de una persona
app.put('/api/update/:cedula', async (req, res) => {
    const { cedula } = req.params;
    const { nueva_direccion } = req.body;

    try {
        const result = await pool.request()
            .input('cedula', sql.VarChar, cedula)
            .input('nueva_direccion', sql.VarChar, nueva_direccion)
            .execute('ActualizarDireccion');

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: 'Dirección actualizada exitosamente' });
        } else {
            res.status(404).json({ message: 'Cédula no encontrada' });
        }
    } catch (error) {
        console.error('Error al actualizar dirección:', error);
        res.status(500).json({ message: 'Error al actualizar dirección', error: error.message });
    }
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});