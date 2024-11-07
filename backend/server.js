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





// Endpoint para obtener todos los productos
app.get('/api/products/', async (req, res) => {
    try {
        console.log("Iniciando consulta para obtener los productos de una persona");
        const result = await pool.request()
            .query('SELECT * FROM products');
        console.log("Resultado de la consulta:", result);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).send('Error al obtener productos');
    }
});




//endpoint para obtener las ordenes de un usuario
app.get('/api/cart/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log("Iniciando consulta para obtener los productos en el carrito de un usuario");
        const result = await pool.request()
            .input('user_id', sql.Int, id)
            .query(`
                SELECT p.id AS product_id, p.name AS product_name, p.description, p.price, p.stock, p.image_url, 
                       c.quantity, c.added_date
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = @user_id
            `);
        console.log("Resultado de la consulta:", result);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener productos en el carrito:', err);
        res.status(500).send('Error al obtener productos en el carrito');
    }
});



// Endpoint para obtener los productos en el carrito de todos los usuarios
app.get('/api/carts', verifyToken, async (req, res) => {
    try {
        console.log("Iniciando consulta para obtener los productos en el carrito de todos los usuarios");
        const result = await pool.request()
            .query(`
                SELECT c.user_id, p.id AS product_id, p.name AS product_name, p.description, p.price, p.stock, p.image_url, 
                       c.quantity, c.added_date
                FROM cart c
                JOIN products p ON c.product_id = p.id;
            `);
        console.log("Resultado de la consulta:", result);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener productos en el carrito:', err);
        res.status(500).send('Error al obtener productos en el carrito');
    }
});


app.post('/api/register', async (req, res) => {
    const { first_name, last_name, email, password, address, number } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.request()
            .input('first_name', sql.VarChar, first_name)
            .input('last_name', sql.VarChar, last_name)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('address', sql.VarChar, address)
            .input('phone_number', sql.VarChar, number)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM users WHERE email = @email)
                BEGIN
                    INSERT INTO users (first_name, last_name, email, password, address, phone_number) 
                    VALUES (@first_name, @last_name, @email, @password, @address, @phone_number)
                END
            `);

        if (result.rowsAffected[0] > 0) {
            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        } else {
            res.status(200).json({ message: 'El usuario ya existe y no se realizó ninguna acción' });
        }
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

app.post('/api/login', async (req, res) => {
    console.log("Iniciando sesión");
    const { email, password } = req.body;

    try {
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result.recordset[0];   
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
        
        res.json({
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                address: user.address,
                phone_number: user.phone_number,
                user_role: user.user_role
            }
        });
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Eliminar las reseñas del usuario
        await pool.request()
            .input('user_id', sql.Int, parseInt(id))
            .query('DELETE FROM reviews WHERE user_id = @user_id');

        // 2. Eliminar el carrito asociado al usuario
        await pool.request()
            .input('user_id', sql.Int, parseInt(id))
            .query('DELETE FROM cart WHERE user_id = @user_id');

        // 3. Eliminar las transacciones relacionadas con las órdenes del usuario
        await pool.request()
            .input('user_id', sql.Int, parseInt(id))
            .query('DELETE FROM transactions WHERE order_id IN (SELECT id FROM orders WHERE user_id = @user_id)');

        // 4. Eliminar los detalles de los pedidos relacionados con las órdenes del usuario
        await pool.request()
            .input('user_id', sql.Int, parseInt(id))
            .query('DELETE FROM order_details WHERE order_id IN (SELECT id FROM orders WHERE user_id = @user_id)');

        // 5. Eliminar las órdenes relacionadas con el usuario
        await pool.request()
            .input('user_id', sql.Int, parseInt(id))
            .query('DELETE FROM orders WHERE user_id = @user_id');

        // 6. Finalmente, eliminar el usuario
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM users WHERE id = @id');

        console.log("Resultado de la consulta:", result);

        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Usuario borrado exitosamente');
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    } catch (err) {
        console.error('Error al borrar usuario:', err);
        res.status(500).send('Error al borrar usuario');
    }
});

// Endpoint para actualizar la edad de una persona (PUT)
app.put('/api/actualizar', verifyToken, async (req, res) => {
    const { id, age } = req.body;

    try {
        console.log("Iniciando consulta para actualizar la edad de la persona");
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id)) // Convertir id a entero
            .input('age', sql.Int, parseInt(age)) // Convertir age a entero
            .query('UPDATE users SET age = @age WHERE id = @id');
        
        console.log("Resultado de la consulta:", result);

        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Edad de la persona actualizada exitosamente');
        } else {
            res.status(404).send('Usuario no encontrado');
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