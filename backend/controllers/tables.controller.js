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


// 🔧 Función reutilizable para obtener estructura de una tabla
const obtenerEstructuraDesdeBD = async (nombreTabla, connection, dbType) => {
  const columnasQuery = dbType === 'Postgre'
    ? `
      SELECT 
        column_name AS nombre,
        data_type AS tipo,
        is_nullable = 'YES' AS aceptaNulos,
        column_default AS valorDefecto
      FROM information_schema.columns 
      WHERE table_name = '${nombreTabla}'
    `
    : `
      SELECT 
        c.name AS nombre,
        t.name AS tipo,
        c.is_nullable AS aceptaNulos,
        dc.definition AS valorDefecto
      FROM sys.columns c
      JOIN sys.types t ON c.user_type_id = t.user_type_id
      LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
      WHERE OBJECT_NAME(c.object_id) = '${nombreTabla}';
    `;

  const resultado = dbType === 'SQL'
    ? await connection.request().query(columnasQuery)
    : await connection.query(columnasQuery);

  return dbType === 'SQL' ? resultado.recordset : resultado.rows;
};



const obtenerEstructuraTabla = async (req, res) => {
  const { nombreTabla } = req.params;
  const { connection, dbType } = getConnection();

  if (!connection || !nombreTabla) {
    return res.status(400).json({ success: false, message: '❌ Falta conexión o nombre de la tabla' });
  }

  try {
    const columnas = await obtenerEstructuraDesdeBD(nombreTabla, connection, dbType);
    return res.json({ success: true, columnas });
  } catch (err) {
    console.error('❌ Error al obtener estructura:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};


const insertarDatosEnTabla = async (req, res) => {
  const { nombreTabla } = req.params;
  const datos = req.body;
  const { connection, dbType } = getConnection();

  if (!connection || !nombreTabla || !datos || typeof datos !== 'object') {
    return res.status(400).json({ success: false, message: '❌ Solicitud inválida' });
  }

  try {
    // ✅ Reutilizando la función utilitaria
    const columnas = await obtenerEstructuraDesdeBD(nombreTabla, connection, dbType);

    // 🔍 Filtrar columnas insertables
    const columnasInsertables = columnas.filter((col) => {
      // Si la columna es genre_id (clave primaria autoincremental), no la incluimos
      if (col.nombre === 'genre_id' && col.tipo === 'integer' && col.valorDefecto === 'nextval') {
        return false; // Excluimos genre_id si es autoincremental
      }
      const noTieneDefault = col.valorDefecto === null || col.valorDefecto === undefined;
      const fueProporcionada = Object.keys(datos).includes(col.nombre);
      return fueProporcionada || noTieneDefault;
    });

    if (columnasInsertables.length === 0) {
      return res.status(400).json({ success: false, message: '⚠️ No se proporcionaron columnas válidas para insertar' });
    }

    const nombres = columnasInsertables.map((col) => dbType === 'SQL' ? `[${col.nombre}]` : `"${col.nombre}"`);
    const valores = columnasInsertables.map((col) => formatearValor(datos[col.nombre]));

    const query = `INSERT INTO ${dbType === 'SQL' ? `[${nombreTabla}]` : `"${nombreTabla}"`} (${nombres.join(', ')}) VALUES (${valores.join(', ')})`;

    await (dbType === 'SQL'
      ? connection.request().query(query)
      : connection.query(query));

    return res.json({ success: true, message: '✅ Inserción realizada con éxito' });
  } catch (err) {
    console.error(`❌ Error al insertar dinámicamente en ${nombreTabla}:`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};


const obtenerPermisosTabla = async (req, res) => {
  const { nombreTabla } = req.params;
  const { connection, dbType } = getConnection();

  if (!connection || !nombreTabla) {
    return res.status(400).json({ 
      success: false, 
      message: '❌ Falta conexión o nombre de la tabla',
      permisos: { read: false, write: false, admin: false },
      columnPermisos: {}
    });
  }

  try {
    // First, get the current user
    let currentUserQuery;
    if (dbType === 'Postgre') {
      currentUserQuery = 'SELECT current_user as usuario';
    } else if (dbType === 'SQL') {
      currentUserQuery = 'SELECT SYSTEM_USER as usuario';
    }
    
    const currentUserResult = await (dbType === 'SQL' 
      ? connection.request().query(currentUserQuery)
      : connection.query(currentUserQuery));
    
    const currentUser = dbType === 'SQL' 
      ? currentUserResult.recordset[0].usuario 
      : currentUserResult.rows[0].usuario;

    // Get table-level permissions
    let tableQuery;
    let columnQuery;
    
    if (dbType === 'Postgre') {
      tableQuery = `
        SELECT 
          privilege_type as permiso
        FROM information_schema.role_table_grants 
        WHERE table_name = '${nombreTabla}'
        AND grantee = '${currentUser}';
      `;

      columnQuery = `
        SELECT 
          column_name,
          privilege_type as permiso
        FROM information_schema.role_column_grants 
        WHERE table_name = '${nombreTabla}'
        AND grantee = '${currentUser}';
      `;

      const [tableResult, columnResult] = await Promise.all([
        connection.query(tableQuery),
        connection.query(columnQuery)
      ]);
      
      // Process table permissions
      const tablePermisos = tableResult.rows.map(p => p.permiso);
      const permisosSimplificados = {
        read: tablePermisos.includes('SELECT'),
        write: tablePermisos.includes('INSERT') || tablePermisos.includes('UPDATE') || tablePermisos.includes('DELETE'),
        admin: tablePermisos.includes('ALL') || tablePermisos.includes('OWNER')
      };

      // Process column permissions
      const columnPermisos = {};
      columnResult.rows.forEach(row => {
        if (!columnPermisos[row.column_name]) {
          columnPermisos[row.column_name] = {
            read: false,
            write: false
          };
        }
        if (row.permiso === 'SELECT') {
          columnPermisos[row.column_name].read = true;
        }
        if (['INSERT', 'UPDATE'].includes(row.permiso)) {
          columnPermisos[row.column_name].write = true;
        }
      });

      return res.json({ 
        success: true, 
        permisos: permisosSimplificados,
        columnPermisos
      });
    } else if (dbType === 'SQL') {
      tableQuery = `
        SELECT 
          permission_name as permiso
        FROM sys.database_permissions dp
        JOIN sys.database_principals dp1 ON dp.grantee_principal_id = dp1.principal_id
        WHERE OBJECT_NAME(major_id) = '${nombreTabla}'
        AND USER_NAME(grantee_principal_id) = '${currentUser}';
      `;

      columnQuery = `
        SELECT 
          c.name as column_name,
          dp.permission_name as permiso
        FROM sys.database_permissions dp
        JOIN sys.database_principals dp1 ON dp.grantee_principal_id = dp1.principal_id
        JOIN sys.columns c ON dp.major_id = c.object_id AND dp.minor_id = c.column_id
        WHERE OBJECT_NAME(dp.major_id) = '${nombreTabla}'
        AND USER_NAME(dp.grantee_principal_id) = '${currentUser}';
      `;
      
      const [tableResult, columnResult] = await Promise.all([
        connection.request().query(tableQuery),
        connection.request().query(columnQuery)
      ]);
      
      // Process table permissions
      const tablePermisos = tableResult.recordset.map(p => p.permiso);
      const permisosSimplificados = {
        read: tablePermisos.includes('SELECT'),
        write: tablePermisos.includes('INSERT') || tablePermisos.includes('UPDATE') || tablePermisos.includes('DELETE'),
        admin: tablePermisos.includes('CONTROL') || tablePermisos.includes('ALTER')
      };

      // Process column permissions
      const columnPermisos = {};
      columnResult.recordset.forEach(row => {
        if (!columnPermisos[row.column_name]) {
          columnPermisos[row.column_name] = {
            read: false,
            write: false
          };
        }
        if (row.permiso === 'SELECT') {
          columnPermisos[row.column_name].read = true;
        }
        if (['INSERT', 'UPDATE'].includes(row.permiso)) {
          columnPermisos[row.column_name].write = true;
        }
      });

      return res.json({ 
        success: true, 
        permisos: permisosSimplificados,
        columnPermisos
      });
    }
  } catch (err) {
    console.error('❌ Error al obtener permisos:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: err.message,
      permisos: { read: false, write: false, admin: false },
      columnPermisos: {}
    });
  }
};


module.exports = {
  generarTablas,
  obtenerDatosDeTabla,
  editarDatosDeTabla,
  eliminarDatosDeTabla,
  obtenerEstructuraTabla,
  insertarDatosEnTabla,
  obtenerPermisosTabla,
};
