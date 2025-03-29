const { getConnection } = require('../Conections/ConnectionStore');

// 🔍 Listar todas las tablas según la DB activa
const generarTablas = async (req, res) => {
  const { connection, dbType } = getConnection();

  if (!connection) {
    return res.status(400).json({
      success: false,
      message: '❌ No hay conexión activa a la base de datos',
    });
  }

  let query;
  if (dbType === 'SQL') {
    query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'dbo'
        AND table_type = 'BASE TABLE';
    `;
    try {
      const result = await connection.request().query(query);
      res.json({ success: true, tablas: result.recordset });
    } catch (err) {
      console.error('❌ Error al obtener tablas (SQL):', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  } else if (dbType === 'Postgre') {
    query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;
    try {
      const result = await connection.query(query);
      res.json({ success: true, tablas: result.rows });
    } catch (err) {
      console.error('❌ Error al obtener tablas (Postgre):', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    res.status(400).json({ success: false, message: 'Tipo de base de datos no soportado' });
  }
};

// 🔄 SELECT * FROM nombreTabla (hasta 100 registros)
const obtenerDatosDeTabla = async (req, res) => {
  const { nombreTabla } = req.params;
  const { connection, dbType } = getConnection();

  if (!connection) {
    return res.status(400).json({ success: false, message: '❌ No hay conexión activa' });
  }

  if (!nombreTabla) {
    return res.status(400).json({ success: false, message: '❌ Falta el nombre de la tabla' });
  }

  try {
    let query;

    if (dbType === 'SQL') {
      query = `SELECT TOP 100 * FROM [${nombreTabla}]`;
      const result = await connection.request().query(query);
      console.log(result.recordset);
      
      return res.json({ success: true, datos: result.recordset });
    }

    if (dbType === 'Postgre') {
      query = `SELECT * FROM "${nombreTabla}" LIMIT 100`;
      const result = await connection.query(query);
      return res.json({ success: true, datos: result.rows });
    }

    return res.status(400).json({ success: false, message: 'Tipo de base de datos no soportado' });
  } catch (err) {
    console.error(`❌ Error al consultar tabla "${nombreTabla}":`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  generarTablas,
  obtenerDatosDeTabla,
};
