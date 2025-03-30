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


const formatearValor = (valor) => {
  if (valor === null || valor === undefined) return 'NULL';
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'boolean') return valor ? 'TRUE' : 'FALSE';
  return `'${valor.toString().replace(/'/g, "''")}'`; // escapar comillas simples
};



const editarDatosDeTabla = async (req, res) => {
  const { nombreTabla } = req.params;
  const datos = req.body;
  const { connection, dbType } = getConnection();

  if (!connection) {
    return res.status(400).json({ success: false, message: '❌ No hay conexión activa' });
  }

  if (!nombreTabla) {
    return res.status(400).json({ success: false, message: '❌ Falta el nombre de la tabla' });
  }

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return res.status(400).json({ success: false, message: '❌ Datos de actualización inválidos' });
  }

  try {
    // Detectar llave primaria como primera propiedad
    const columnas = Object.keys(datos);
    const llavePrimaria = columnas[0]; // asumimos que la primera es la PK
    const valorPK = datos[llavePrimaria];

    // Construcción dinámica del SET
    const sets = columnas
      .filter((col) => col !== llavePrimaria)
      .map((col) => {
        const valor = datos[col];
        // En SQL Server y Postgre usamos comillas dobles para columnas con espacios o mayúsculas
        return dbType === 'SQL'
          ? `[${col}] = ${formatearValor(valor)}`
          : `"${col}" = ${formatearValor(valor)}`;
      })
      .join(', ');

    // Construcción de la condición WHERE
    const where = dbType === 'SQL'
      ? `[${llavePrimaria}] = ${formatearValor(valorPK)}`
      : `"${llavePrimaria}" = ${formatearValor(valorPK)}`;

    const query = dbType === 'SQL'
      ? `UPDATE [${nombreTabla}] SET ${sets} WHERE ${where}`
      : `UPDATE "${nombreTabla}" SET ${sets} WHERE ${where}`;

    if (dbType === 'SQL') {
      await connection.request().query(query);
    } else if (dbType === 'Postgre') {
      await connection.query(query);
    }

    return res.json({ success: true, message: '✅ Datos actualizados correctamente' });
  } catch (err) {
    console.error(`❌ Error al editar la tabla "${nombreTabla}":`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};


const obtenerRelacionesExternas = async (nombreTabla, dbType, connection) => {
  if (dbType === 'Postgre') {
    const query = `
      SELECT
        tc.table_name AS referencing_table,
        kcu.column_name AS referencing_column
      FROM
        information_schema.table_constraints AS tc
      JOIN
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.constraint_schema = kcu.constraint_schema
      JOIN
        information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.constraint_schema = tc.constraint_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = '${nombreTabla}';
    `;
    const result = await connection.query(query);
    return result.rows;
  }

  if (dbType === 'SQL') {
    const query = `
      SELECT 
        OBJECT_NAME(fk.parent_object_id) AS referencing_table,
        c.name AS referencing_column
      FROM sys.foreign_keys AS fk
      JOIN sys.foreign_key_columns AS fkc 
        ON fk.object_id = fkc.constraint_object_id
      JOIN sys.columns AS c 
        ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
      WHERE fk.referenced_object_id = OBJECT_ID('${nombreTabla}');
    `;
    const result = await connection.request().query(query);
    return result.recordset;
  }

  return [];
};



const eliminarDatosDeTabla = async (req, res) => {
  const { nombreTabla } = req.params;
  const datos = req.body;
  const { connection, dbType } = getConnection();

  if (!connection) {
    return res.status(400).json({ success: false, message: '❌ No hay conexión activa' });
  }

  if (!nombreTabla) {
    return res.status(400).json({ success: false, message: '❌ Falta el nombre de la tabla' });
  }

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return res.status(400).json({ success: false, message: '❌ Datos de eliminación inválidos' });
  }

  try {
    const columnas = Object.keys(datos);
    const llavePrimaria = columnas[0]; // Suponemos que la primera propiedad es la PK
    const valorPK = datos[llavePrimaria];

    if (!llavePrimaria || valorPK === undefined) {
      return res.status(400).json({ success: false, message: '❌ Falta la llave primaria' });
    }

    // 1. Buscar claves foráneas que apunten a esta tabla
    const relaciones = await obtenerRelacionesExternas(nombreTabla, dbType, connection);

    // 2. Limpiar relaciones: UPDATE referencing_table SET referencing_column = NULL WHERE referencing_column = valorPK
    for (const rel of relaciones) {
      const { referencing_table, referencing_column } = rel;

      const nullifyQuery =
        dbType === 'SQL'
          ? `UPDATE [${referencing_table}] SET [${referencing_column}] = NULL WHERE [${referencing_column}] = ${formatearValor(valorPK)}`
          : `UPDATE "${referencing_table}" SET "${referencing_column}" = NULL WHERE "${referencing_column}" = ${formatearValor(valorPK)}`;

      await (dbType === 'SQL'
        ? connection.request().query(nullifyQuery)
        : connection.query(nullifyQuery));
    }

    // 3. Ejecutar el DELETE
    const where =
      dbType === 'SQL'
        ? `[${llavePrimaria}] = ${formatearValor(valorPK)}`
        : `"${llavePrimaria}" = ${formatearValor(valorPK)}`;

    const deleteQuery =
      dbType === 'SQL'
        ? `DELETE FROM [${nombreTabla}] WHERE ${where}`
        : `DELETE FROM "${nombreTabla}" WHERE ${where}`;

    await (dbType === 'SQL'
      ? connection.request().query(deleteQuery)
      : connection.query(deleteQuery));

    return res.json({ success: true, message: '✅ Datos eliminados correctamente' });
  } catch (err) {
    console.error(`❌ Error al eliminar datos de la tabla "${nombreTabla}":`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};






module.exports = {
  generarTablas,
  obtenerDatosDeTabla,
  editarDatosDeTabla,
  eliminarDatosDeTabla,
};
