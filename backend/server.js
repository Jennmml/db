const express = require('express');
const cors = require('cors');

const { connect: connectSQL } = require("./Conections/ConectorSqlServer");
const { connect: connectPostgres } = require("./Conections/ConectorPostgre");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.post('/api/conectar', async (req, res) => {
  const { dbType, host, username, password, dbname } = req.body;

  console.log("📥 Recibido:", { dbType, host, username, dbname });

  const config = {
    user: username,
    password: password,
    host: host,
    database: dbname,
  };

  try {
    if (dbType === 'SQL') {
      console.log("🔌 Conectando a SQL Server...");
      await connectSQL(config);
    } else if (dbType === 'Postgre') {
      console.log("🔌 Conectando a PostgreSQL...");
      await connectPostgres(config);
    } else {
      return res.status(400).json({ success: false, message: 'Tipo de base de datos no soportado' });
    }

    res.json({ success: true, message: '✅ Conexión exitosa' });
  } catch (err) {
    console.error('❌ Error al conectar:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('🚀 API de conexión a bases de datos funcionando.');
});

app.listen(port, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${port}`);
});
