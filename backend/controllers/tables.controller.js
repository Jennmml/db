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
  const { preview, prefix, schema } = req.query;
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

    // Save as stored procedure if prefix is provided (in both modes)
    if (prefix) {
      const procResult = await guardarQueryComoProcedimiento(connection, dbType, query, prefix, schema, 'UPDATE');
      if (!procResult.success) {
        console.warn('⚠️ No se pudo crear el procedimiento almacenado:', procResult.message);
      }
    }

    // Execute the query if not in preview mode
    if (preview !== 'true') {
      if (dbType === 'SQL') {
        await connection.request().query(query);
      } else if (dbType === 'Postgre') {
        await connection.query(query);
      }
    }

    return res.json({ 
      success: true, 
      message: preview === 'true' ? '✅ Query generada correctamente' : '✅ Datos actualizados correctamente',
      query,
      preview: preview === 'true',
      procedureResult: prefix ? await guardarQueryComoProcedimiento(connection, dbType, query, prefix, schema, 'UPDATE') : null
    });
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
  const { preview, prefix, schema } = req.query;
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

    // 2. Generar queries para limpiar relaciones
    const nullifyQueries = relaciones.map(rel => {
      const { referencing_table, referencing_column } = rel;
      return dbType === 'SQL'
        ? `UPDATE [${referencing_table}] SET [${referencing_column}] = NULL WHERE [${referencing_column}] = ${formatearValor(valorPK)}`
        : `UPDATE "${referencing_table}" SET "${referencing_column}" = NULL WHERE "${referencing_column}" = ${formatearValor(valorPK)}`;
    });

    // 3. Generar query de DELETE
    const where =
      dbType === 'SQL'
        ? `[${llavePrimaria}] = ${formatearValor(valorPK)}`
        : `"${llavePrimaria}" = ${formatearValor(valorPK)}`;

    const deleteQuery =
      dbType === 'SQL'
        ? `DELETE FROM [${nombreTabla}] WHERE ${where}`
        : `DELETE FROM "${nombreTabla}" WHERE ${where}`;

    // Save as stored procedures if prefix is provided (in both modes)
    let procedureResults = null;
    if (prefix) {
      // Save nullify queries as separate procedures
      const nullifyProcedures = await Promise.all(
        nullifyQueries.map((q, index) => 
          guardarQueryComoProcedimiento(connection, dbType, q, `${prefix}_nullify_${index + 1}`, schema, 'UPDATE')
        )
      );

      // Save delete query as a procedure
      const deleteProcedure = await guardarQueryComoProcedimiento(
        connection, dbType, deleteQuery, `${prefix}_delete`, schema, 'DELETE'
      );

      procedureResults = {
        nullifyProcedures,
        deleteProcedure
      };
    }

    // Execute the queries if not in preview mode
    if (preview !== 'true') {
      for (const nullifyQuery of nullifyQueries) {
        await (dbType === 'SQL'
          ? connection.request().query(nullifyQuery)
          : connection.query(nullifyQuery));
      }

      await (dbType === 'SQL'
        ? connection.request().query(deleteQuery)
        : connection.query(deleteQuery));
    }

    return res.json({ 
      success: true, 
      message: preview === 'true' ? '✅ Queries generadas correctamente' : '✅ Datos eliminados correctamente',
      queries: {
        nullifyQueries,
        deleteQuery
      },
      preview: preview === 'true',
      procedureResults
    });
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
  const { preview, prefix, schema } = req.query;
  const { connection, dbType } = getConnection();

  if (!connection || !nombreTabla || !datos || typeof datos !== 'object') {
    return res.status(400).json({ success: false, message: '❌ Solicitud inválida' });
  }

  try {
    console.log('📝 Datos recibidos:', datos);
    const columnas = await obtenerEstructuraDesdeBD(nombreTabla, connection, dbType);
    console.log('📊 Estructura de la tabla:', columnas);

    // 🔍 Filtrar columnas insertables
    const columnasInsertables = columnas.filter((col) => {
      // Si es una columna autoincremental, la excluimos
      const esAutoIncremental = 
        (dbType === 'SQL' && (
          (col.valorDefecto && col.valorDefecto.includes('IDENTITY')) ||
          (col.tipo && col.tipo.toLowerCase().includes('identity'))
        )) ||
        (dbType === 'Postgre' && (
          (col.valorDefecto && col.valorDefecto.includes('nextval')) ||
          (col.tipo && col.tipo.toLowerCase().includes('serial'))
        ));

      if (esAutoIncremental) {
        console.log(`⚠️ Columna excluida por ser autoincremental: ${col.nombre}`);
        return false;
      }

      // Si el valor fue proporcionado explícitamente
      if (datos[col.nombre] !== undefined) {
        console.log(`✅ Columna incluida por tener valor proporcionado: ${col.nombre}`);
        return true;
      }

      // Si la columna acepta nulos o tiene valor por defecto, la incluimos
      if (col.aceptaNulos || col.valorDefecto !== null) {
        console.log(`✅ Columna incluida por ${col.aceptaNulos ? 'aceptar nulos' : 'tener valor por defecto'}: ${col.nombre}`);
        return true;
      }

      console.log(`❌ Columna excluida por no cumplir criterios: ${col.nombre}`);
      return false;
    });

    console.log('📋 Columnas insertables:', columnasInsertables);

    if (columnasInsertables.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '⚠️ No se encontraron columnas válidas para insertar. Asegúrese de proporcionar valores para las columnas requeridas.',
        debug: {
          datosRecibidos: datos,
          estructuraTabla: columnas,
          razon: 'No se encontraron columnas que cumplan los criterios de inserción'
        }
      });
    }

    const nombres = columnasInsertables.map((col) => dbType === 'SQL' ? `[${col.nombre}]` : `"${col.nombre}"`);
    const valores = columnasInsertables.map((col) => {
      const valor = datos[col.nombre];
      // Si no se proporcionó valor y la columna tiene default, la excluimos
      if (valor === undefined && col.valorDefecto !== null) {
        return 'DEFAULT';
      }
      // Si no se proporcionó valor y acepta nulos, ponemos NULL
      if (valor === undefined && col.aceptaNulos) {
        return 'NULL';
      }
      // En otro caso, usamos el valor proporcionado
      return formatearValor(valor);
    });

    const query = `INSERT INTO ${dbType === 'SQL' ? `[${nombreTabla}]` : `"${nombreTabla}"`} (${nombres.join(', ')}) VALUES (${valores.join(', ')})`;
    console.log('🔍 Query generada:', query);

    // Save as stored procedure if prefix is provided (in both modes)
    let procedureResult = null;
    if (prefix) {
      procedureResult = await guardarQueryComoProcedimiento(connection, dbType, query, prefix, schema, 'INSERT');
      if (!procedureResult.success) {
        console.warn('⚠️ No se pudo crear el procedimiento almacenado:', procedureResult.message);
      }
    }

    // Execute the query if not in preview mode
    if (preview !== 'true') {
      await (dbType === 'SQL'
        ? connection.request().query(query)
        : connection.query(query));
    }

    return res.json({ 
      success: true, 
      message: preview === 'true' ? '✅ Query generada correctamente' : '✅ Inserción realizada con éxito',
      query,
      preview: preview === 'true',
      procedureResult
    });
  } catch (err) {
    console.error(`❌ Error al insertar dinámicamente en ${nombreTabla}:`, err.message);
    return res.status(500).json({ 
      success: false, 
      message: err.message,
      debug: {
        datosRecibidos: datos,
        error: err.stack
      }
    });
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

// Add this helper function at the top with other helpers
const guardarQueryComoProcedimiento = async (connection, dbType, query, prefix, schema = 'dbo', operationType) => {
  try {
    // Create a consistent procedure name based on table and operation type
    const procName = `${prefix}_${operationType}`;

    // Verificar si el esquema existe
    let schemaExistsQuery;
    if (dbType === 'SQL') {
      schemaExistsQuery = `
        SELECT SCHEMA_NAME 
        FROM INFORMATION_SCHEMA.SCHEMATA 
        WHERE SCHEMA_NAME = '${schema}'
      `;
    } else if (dbType === 'Postgre') {
      schemaExistsQuery = `
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = '${schema}'
      `;
    }

    const schemaResult = dbType === 'SQL' 
      ? await connection.request().query(schemaExistsQuery)
      : await connection.query(schemaExistsQuery);

    const schemaExists = dbType === 'SQL' 
      ? schemaResult.recordset.length > 0
      : schemaResult.rows.length > 0;

    if (!schemaExists) {
      console.error(`❌ El esquema '${schema}' no existe`);
      return {
        success: false,
        message: `El esquema '${schema}' no existe`,
        error: 'SCHEMA_NOT_FOUND'
      };
    }

    let createProcQuery;
    if (dbType === 'SQL') {
      // Check if procedure exists
      const checkProcQuery = `
        SELECT OBJECT_ID('${schema}.${procName}', 'P') as proc_id
      `;
      const procResult = await connection.request().query(checkProcQuery);
      
      if (procResult.recordset[0].proc_id) {
        // Procedure exists, drop it first
        const dropQuery = `DROP PROCEDURE ${schema}.${procName}`;
        await connection.request().query(dropQuery);
      }

      createProcQuery = `
        CREATE PROCEDURE ${schema}.${procName}
        AS
        BEGIN
          SET NOCOUNT ON;
          ${query};
        END;
      `;
    } else if (dbType === 'Postgre') {
      // For PostgreSQL, we need to create the schema if it doesn't exist
      const createSchemaQuery = `
        CREATE SCHEMA IF NOT EXISTS ${schema};
      `;
      await connection.query(createSchemaQuery);

      // Drop existing procedure if it exists
      const dropQuery = `
        DROP PROCEDURE IF EXISTS ${schema}.${procName}();
      `;
      await connection.query(dropQuery);

      createProcQuery = `
        CREATE OR REPLACE PROCEDURE ${schema}.${procName}()
        LANGUAGE plpgsql
        AS $$
        BEGIN
          ${query};
        END;
        $$;
      `;
    }

    console.log('📝 Query de creación de procedimiento:', createProcQuery);

    if (dbType === 'SQL') {
      await connection.request().query(createProcQuery);
    } else if (dbType === 'Postgre') {
      await connection.query(createProcQuery);
    }

    console.log(`✅ Procedimiento ${schema}.${procName} creado/actualizado exitosamente`);
    return {
      success: true,
      message: `✅ Procedimiento almacenado creado/actualizado: ${schema}.${procName}`,
      procedureName: `${schema}.${procName}`
    };
  } catch (err) {
    console.error('❌ Error al crear procedimiento almacenado:', err);
    console.error('Stack trace:', err.stack);
    return {
      success: false,
      message: `Error al crear procedimiento: ${err.message}`,
      error: err.message,
      stack: err.stack
    };
  }
};

const obtenerEsquemasDisponibles = async (req, res) => {
  const { connection, dbType } = getConnection();

  if (!connection) {
    console.error('❌ No hay conexión activa al intentar obtener esquemas');
    return res.status(400).json({ success: false, message: '❌ No hay conexión activa' });
  }

  try {
    console.log('🔍 Obteniendo esquemas para tipo de DB:', dbType);
    let query;
    if (dbType === 'SQL') {
      query = `
        SELECT 
          s.name as schema_name,
          u.name as schema_owner
        FROM sys.schemas s
        JOIN sys.sysusers u ON s.principal_id = u.uid
        WHERE s.name NOT IN ('sys', 'INFORMATION_SCHEMA', 'guest')
        ORDER BY s.name;
      `;
      const result = await connection.request().query(query);
      console.log('✅ Esquemas SQL Server encontrados:', result.recordset);
      return res.json({ success: true, schemas: result.recordset });
    } else if (dbType === 'Postgre') {
      query = `
        SELECT 
          n.nspname as schema_name,
          pg_get_userbyid(n.nspowner) as schema_owner
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('information_schema', 'pg_catalog')
        AND n.nspname NOT LIKE 'pg_%'
        ORDER BY n.nspname;
      `;
      const result = await connection.query(query);
      console.log('✅ Esquemas PostgreSQL encontrados:', result.rows);
      return res.json({ success: true, schemas: result.rows });
    } else {
      console.error('❌ Tipo de base de datos no soportado:', dbType);
      return res.status(400).json({ success: false, message: 'Tipo de base de datos no soportado' });
    }
  } catch (err) {
    console.error('❌ Error al obtener esquemas:', err.message);
    console.error('Stack trace:', err.stack);
    return res.status(500).json({ 
      success: false, 
      message: `Error al obtener esquemas: ${err.message}`,
      error: err.message
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
  obtenerEsquemasDisponibles,
};
