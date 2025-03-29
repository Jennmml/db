const express = require('express');
const cors = require('cors');
const dbRoutes = require('./routes/db.routes');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());


app.use('/api', dbRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API de conexión a bases de datos funcionando.');
});

app.listen(port, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${port}`);
});
