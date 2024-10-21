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

// Endpoint para obtener todas las personas
app.get('/api/personas', async (req, res) => {
    try {
        console.log("Iniciando consulta para obtener todas las personas");
        const result = await pool.request().query('SELECT * FROM people');
        console.log("Resultado de la consulta:", result);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener personas:', err);
        res.status(500).send('Error al obtener personas');
    }
});

// Endpoint para insertar una persona (POST)
app.post('/api/insertar', async (req, res) => {
    const { name, age } = req.body;  // Usamos req.body en lugar de req.query

    if (!name || !age) {
        return res.status(400).json("Necesita agregar un name y un age");
    }

    try {
        console.log("Iniciando consulta para insertar persona");
        const result = await pool.request()
            .input('name', sql.VarChar, name)
            .input('age', sql.Int, parseInt(age)) // Convertir age a entero
            .query(`
                IF NOT EXISTS (SELECT 1 FROM people WHERE name = @name AND age = @age)
                BEGIN
                    INSERT INTO people (name, age) VALUES (@name, @age)
                END
            `);
        
        console.log("Resultado de la consulta:", result);

        if (result.rowsAffected[0] > 0) {
            res.status(201).send('Persona insertada exitosamente');
        } else {
            res.status(200).send('La persona ya existe y no se realizó ninguna acción');
        }
    } catch (err) {
        console.error('Error al insertar persona:', err);
        res.status(500).send('Error al insertar persona');
    }
});

// Endpoint para borrar una persona (DELETE)
app.delete('/api/borrar', async (req, res) => {
    const { id } = req.query;  // Aquí mantenemos req.query para DELETE

    if (!id) {
        return res.status(400).json("Necesita proporcionar un id");
    }

    try {
        console.log("Iniciando consulta para borrar persona");
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id)) // Convertir id a entero
            .query('DELETE FROM people WHERE id = @id');
        
        console.log("Resultado de la consulta:", result);

        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Persona borrada exitosamente');
        } else {
            res.status(404).send('Persona no encontrada');
        }
    } catch (err) {
        console.error('Error al borrar persona:', err);
        res.status(500).send('Error al borrar persona');
    }
});

// Endpoint para actualizar la edad de una persona (PUT)
app.put('/api/actualizar', async (req, res) => {
    const { id, age } = req.body;  // Usamos req.body en lugar de req.query

    if (!id || !age) {
        return res.status(400).json("Necesita proporcionar un id y age");
    }

    try {
        console.log("Iniciando consulta para actualizar la edad de la persona");
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id)) // Convertir id a entero
            .input('age', sql.Int, parseInt(age)) // Convertir age a entero
            .query('UPDATE people SET age = @age WHERE id = @id');
        
        console.log("Resultado de la consulta:", result);

        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Edad de la persona actualizada exitosamente');
        } else {
            res.status(404).send('Persona no encontrada');
        }
    } catch (err) {
        console.error('Error al actualizar la edad de la persona:', err);
        res.status(500).send('Error al actualizar la edad de la persona');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
