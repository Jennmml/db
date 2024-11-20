-- Crear base de datos y usarla
CREATE DATABASE BD;
USE BD
--USE master;

--ALTER DATABASE BD SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

--DROP DATABASE BD



-- Tabla Personas: Almacena información básica de las personas
CREATE TABLE Personas (
    cedula      VARCHAR(9) PRIMARY KEY, -- Número de cédula único, actúa como clave primaria
    nombre      VARCHAR(15) NOT NULL,   -- Primer nombre de la persona, no puede ser nulo
    apellido1   VARCHAR(15) NOT NULL,   -- Primer apellido de la persona, no puede ser nulo
    apellido2   VARCHAR(15),            -- Segundo apellido de la persona, puede ser nulo
    genero      CHAR(1) NOT NULL,       -- Género de la persona, puede ser 'F' o 'M', no puede ser nulo
    direccion   VARCHAR(200) NOT NULL,  -- Dirección de la persona, no puede ser nulo
    CONSTRAINT CHK_nombre_Personas CHECK (nombre LIKE '[A-Za-z]%'),      -- Verifica que el nombre comience con una letra
    CONSTRAINT CHK_apellido1_Personas CHECK (apellido1 LIKE '[A-Za-z]%'), -- Verifica que el primer apellido comience con una letra
    CONSTRAINT CHK_apellido2_Personas CHECK (apellido2 LIKE '[A-Za-z]%'), -- Verifica que el segundo apellido comience con una letra (si aplica)
    CONSTRAINT CHK_genero_Personas CHECK (genero IN ('F', 'M'))           -- Verifica que el género sea 'F' o 'M'
);


-- Tabla Administrador: Almacena información de los administradores
CREATE TABLE Administrador (
    cedula                      VARCHAR(9) PRIMARY KEY NOT NULL, -- Número de cédula que actúa como clave primaria y referencia a la tabla Personas
    area_de_responsabilidad     VARCHAR(40) NOT NULL,            -- Área de responsabilidad asignada al administrador, no puede ser nulo
    fecha_ingreso               DATE DEFAULT GETDATE(),          -- Fecha de ingreso del administrador, con un valor por defecto de la fecha actual
    sede                        VARCHAR(30) NOT NULL,            -- Sede de trabajo del administrador, no puede ser nulo
    FOREIGN KEY (cedula) REFERENCES Personas(cedula),            -- Clave foránea que referencia la cédula en la tabla Personas
    CONSTRAINT CHK_area_de_responsabilidad_Administrador CHECK (area_de_responsabilidad LIKE '[A-Za-z]%'), -- Verifica que el área de responsabilidad comience con una letra
    CONSTRAINT CHK_sede_Administrador CHECK (sede LIKE '[A-Za-z]%') -- Verifica que la sede comience con una letra
);


-- Tabla Clientes: Almacena información sobre los clientes registrados
CREATE TABLE Clientes (
    cedula              VARCHAR(9) PRIMARY KEY NOT NULL, -- Número de cédula que actúa como clave primaria y referencia a la tabla Personas
    empresa_asociada    VARCHAR(40) NOT NULL,            -- Empresa asociada al cliente, no puede ser nulo
    estado              VARCHAR(9) NOT NULL,             -- Estado del cliente, puede ser 'Activo' o 'Inactivo'
    fecha_de_registro   DATE DEFAULT GETDATE(),          -- Fecha de registro del cliente, con valor por defecto de la fecha actual
    FOREIGN KEY (cedula) REFERENCES Personas(cedula),    -- Clave foránea que referencia la cédula en la tabla Personas
    CONSTRAINT CHK_estado_clientes CHECK (estado IN ('Activo', 'Inactivo')), -- Verifica que el estado sea 'Activo' o 'Inactivo'
    CONSTRAINT CHK_empresa_asociada_Clientes CHECK (empresa_asociada LIKE '[A-Za-z]%') -- Verifica que la empresa asociada comience con una letra
);


-- Tabla Agentes: Almacena información relacionada con los agentes
CREATE TABLE Agentes (
    cedula                          VARCHAR(9) UNIQUE NOT NULL, -- Número de cédula que actúa como clave única y referencia a la tabla Personas
    estado                          VARCHAR(9) NOT NULL,        -- Estado del agente, puede ser 'Activo' o 'Inactivo'
    numero_de_contratos_asignados   TINYINT NOT NULL,           -- Número de contratos asignados al agente, no puede ser negativo
    reuniones_asociadas             TINYINT NOT NULL,           -- Número de reuniones asociadas al agente, no puede ser negativo
    contratos_asociados             TINYINT NOT NULL,           -- Número de contratos asociados al agente, no puede ser negativo
    fecha_de_registro               DATE DEFAULT GETDATE(),     -- Fecha de registro del agente, con valor por defecto de la fecha actual

    FOREIGN KEY (cedula) REFERENCES Personas(cedula),           -- Clave foránea que referencia la cédula en la tabla Personas
    CONSTRAINT CHK_estado_Agentes CHECK (estado IN ('Activo', 'Inactivo')), -- Verifica que el estado sea 'Activo' o 'Inactivo'
    CONSTRAINT CHK_numero_contratos_Agentes CHECK (numero_de_contratos_asignados >= 0), -- Verifica que el número de contratos asignados sea no negativo
    CONSTRAINT CHK_reuniones_asociadas_Agentes CHECK (reuniones_asociadas >= 0), -- Verifica que el número de reuniones asociadas sea no negativo
    CONSTRAINT CHK_contratos_asociados_Agentes CHECK (contratos_asociados >= 0), -- Verifica que el número de contratos asociados sea no negativo
    CONSTRAINT CHK_fecha_de_registro_Agentes CHECK (fecha_de_registro <= GETDATE()) -- Verifica que la fecha de registro no sea futura
);


-- Tabla Colaboradores: Almacena información de los colaboradores de la organización
CREATE TABLE Colaboradores (
    cedula                      VARCHAR(9) PRIMARY KEY,  -- Número de cédula que actúa como clave primaria y referencia a la tabla Personas
    departamento                VARCHAR(20) NOT NULL,    -- Departamento al que pertenece el colaborador, no puede ser nulo
    rol_contrato                VARCHAR(20) NOT NULL,    -- Rol del colaborador en el contrato, no puede ser nulo
    banda                       INT NOT NULL,            -- Banda salarial o nivel del colaborador, debe ser mayor a 0
    estado                      VARCHAR(9) NOT NULL,     -- Estado del colaborador, puede ser 'Activo' o 'Inactivo'
    fecha_de_incorporacion      DATE DEFAULT GETDATE(),  -- Fecha de incorporación del colaborador, con valor por defecto de la fecha actual

    CONSTRAINT FK_Colaboradores_Personas FOREIGN KEY (cedula) REFERENCES Personas(cedula), -- Clave foránea que referencia la cédula en la tabla Personas
    CONSTRAINT CHK_estado_Colaboradores CHECK (estado IN ('Activo', 'Inactivo')), -- Verifica que el estado sea 'Activo' o 'Inactivo'
    CONSTRAINT CHK_banda_Colaboradores CHECK (banda > 0), -- Verifica que la banda sea mayor a 0
    CONSTRAINT CHK_fecha_incorporacion_Colaboradores CHECK (fecha_de_incorporacion <= GETDATE()) -- Verifica que la fecha de incorporación no sea futura
);



-- Tabla Empresas: Almacena información sobre las empresas registradas
CREATE TABLE Empresas (
    id_empresa      VARCHAR(9) PRIMARY KEY NOT NULL,  -- Identificador único de la empresa, actúa como clave primaria
    nombre_expresa  VARCHAR(30) NOT NULL,             -- Nombre de la empresa, no puede ser nulo
    direccion       VARCHAR(200) NOT NULL,            -- Dirección de la empresa, no puede ser nulo

    CONSTRAINT CHK_nombre_expresa_Empresas CHECK (nombre_expresa LIKE '[A-Za-z]%'), -- Verifica que el nombre de la empresa comience con una letra
    CONSTRAINT CHK_direccion_Empresas CHECK (direccion LIKE '[A-Za-z0-9]%') -- Verifica que la dirección comience con un carácter alfanumérico
);


-- Tabla Contratos: Almacena la información relacionada con los contratos
CREATE TABLE Contratos (
    id_contrato         VARCHAR(9) PRIMARY KEY NOT NULL,  -- Identificador único del contrato, actúa como clave primaria
    cedula_cliente      VARCHAR(9) NOT NULL,              -- Número de cédula del cliente asociado al contrato, no puede ser nulo
    fecha_creacion      DATE DEFAULT GETDATE() NOT NULL,  -- Fecha de creación del contrato, con valor por defecto de la fecha actual, no puede ser nulo
    fecha_finalizacion  DATE DEFAULT GETDATE() NOT NULL,  -- Fecha de finalización del contrato, con valor por defecto de la fecha actual, no puede ser nulo
    estado              VARCHAR(8) NOT NULL,              -- Estado del contrato, puede ser 'Activo' o 'Inactivo'

    CONSTRAINT CHK_estado_Contratos CHECK (estado IN ('Activo', 'Inactivo')), -- Verifica que el estado sea 'Activo' o 'Inactivo'
    CONSTRAINT CHK_fechas_Contratos CHECK (fecha_finalizacion >= fecha_creacion) -- Verifica que la fecha de finalización sea posterior o igual a la fecha de creación
);


-- Tabla Departamentos: Almacena información sobre los departamentos de una empresa
CREATE TABLE Departamentos (
    id_departamento     VARCHAR(9) PRIMARY KEY NOT NULL,    -- Identificador único del departamento, actúa como clave primaria
    nombre              VARCHAR(30) NOT NULL,               -- Nombre del departamento, no puede ser nulo
    descripcion         VARCHAR(200) NOT NULL,              -- Descripción del departamento, no puede ser nulo
    cantidad_personal   SMALLINT NOT NULL,                  -- Cantidad de personal en el departamento, no puede ser negativa
    agente_coordinador  VARCHAR(30) NOT NULL,               -- Nombre del agente coordinador del departamento, no puede ser nulo
    id_empresa          VARCHAR(9) NOT NULL,                -- Identificador de la empresa a la que pertenece el departamento, no puede ser nulo

    -- Aquí se define la relación entre Empresa y Departamentos (E_DEP)
    FOREIGN KEY (id_empresa) REFERENCES Empresas(id_empresa)
    ON DELETE CASCADE ON UPDATE CASCADE,                    -- Define el comportamiento en caso de eliminación o actualización de una empresa

    CONSTRAINT CHK_nombre_Departamentos CHECK (nombre LIKE '[A-Za-z]%'), -- Verifica que el nombre comience con una letra
    CONSTRAINT CHK_cantidad_personal_Departamentos CHECK (cantidad_personal >= 0) -- Verifica que la cantidad de personal sea no negativa
);


-- Tabla Reuniones: Almacena información sobre reuniones programadas
CREATE TABLE Reuniones (
    id_reunion         VARCHAR(9) PRIMARY KEY NOT NULL, -- Identificador único de la reunión, actúa como clave primaria
    titulo             VARCHAR(30) NOT NULL,            -- Título de la reunión, no puede ser nulo
    descripcion        VARCHAR(200) NOT NULL,           -- Descripción de la reunión, no puede ser nulo
    fecha              DATE NOT NULL,                   -- Fecha de la reunión, no puede ser nula
    hora               TIME NOT NULL,                   -- Hora de la reunión, no puede ser nula
    estado             VARCHAR(8) NOT NULL,             -- Estado de la reunión, puede ser 'Activo' o 'Inactivo'
    modalidad          VARCHAR(10) NOT NULL,            -- Modalidad de la reunión, puede ser 'Virtual' o 'Presencial'
    agente_acargo      VARCHAR(9) NOT NULL,             -- Identificador del agente a cargo de la reunión, no puede ser nulo

    CONSTRAINT CHK_estado_Reuniones CHECK (estado IN ('Inactivo', 'Activo')), -- Verifica que el estado sea 'Activo' o 'Inactivo'
    CONSTRAINT CHK_modalidad_Reuniones CHECK (modalidad IN ('Virtual', 'Presencial')), -- Verifica que la modalidad sea 'Virtual' o 'Presencial'
    CONSTRAINT CHK_fecha_Reuniones CHECK (fecha >= GETDATE()) -- Verifica que la fecha de la reunión no sea anterior a la fecha actual
);


-- Tabla Documentacion: Almacena información sobre la documentación registrada
CREATE TABLE Documentacion (
    id_documento     VARCHAR(9) PRIMARY KEY NOT NULL,  -- Identificador único del documento, actúa como clave primaria
    titulo           VARCHAR(20) NOT NULL,             -- Título del documento, no puede ser nulo
    descripcion      VARCHAR(200) NOT NULL,            -- Descripción del contenido del documento, no puede ser nulo
    fecha            DATE DEFAULT GETDATE() NOT NULL,  -- Fecha de registro del documento, con valor por defecto de la fecha actual, no puede ser nulo
    tipo             VARCHAR(15) NOT NULL,             -- Tipo de documento, puede ser 'Contrato', 'Registro', 'Actualización', 'Formal' o 'Mensaje'

    CONSTRAINT CHK_titulo_Documentacion CHECK (titulo LIKE '[A-Za-z]%'), -- Verifica que el título comience con una letra
    CONSTRAINT CHK_tipo_Documentacion CHECK (tipo IN ('Contrato', 'Registro', 'Actualización', 'Formal', 'Mensaje')) -- Verifica que el tipo sea uno de los valores permitidos
);


-- Tabla Telefonos_Personas: Almacena los números de teléfono asociados a personas
CREATE TABLE Telefonos_Personas (
    id_telefono     INT IDENTITY(1,1) PRIMARY KEY,       -- Identificador único del teléfono, se incrementa automáticamente
    cedula          VARCHAR(9),                         -- Número de cédula de la persona a la que pertenece el teléfono, puede ser nulo
    telefono        VARCHAR(9) NOT NULL,                -- Número de teléfono, no puede ser nulo

    CONSTRAINT fk_persona FOREIGN KEY (cedula) REFERENCES Personas(cedula) ON DELETE CASCADE -- Clave foránea que referencia la cédula en la tabla Personas; elimina el registro si la persona es eliminada
);


-- Tabla Telefonos_Empresas: Almacena los números de teléfono asociados a empresas
CREATE TABLE Telefonos_Empresas (
    id_telefono     INT IDENTITY(1,1) PRIMARY KEY,       -- Identificador único del teléfono, se incrementa automáticamente
    id_empresa      VARCHAR(9),                         -- Identificador de la empresa a la que pertenece el teléfono, puede ser nulo
    telefono        VARCHAR(9) NOT NULL,                -- Número de teléfono, no puede ser nulo

    CONSTRAINT fk_empresa FOREIGN KEY (id_empresa) REFERENCES Empresas(id_empresa) ON DELETE CASCADE -- Clave foránea que referencia el id de la empresa en la tabla Empresas; elimina el registro si la empresa es eliminada
);


-- Tabla Telefonos_Departamentos: Almacena los números de teléfono asociados a departamentos
CREATE TABLE Telefonos_Departamentos (
    id_telefono     INT IDENTITY(1,1) PRIMARY KEY,       -- Identificador único del teléfono, se incrementa automáticamente
    id_departamento VARCHAR(9),                         -- Identificador del departamento al que pertenece el teléfono, puede ser nulo
    telefono        VARCHAR(9) NOT NULL,                -- Número de teléfono, no puede ser nulo

    CONSTRAINT fk_departamento FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento) ON DELETE CASCADE -- Clave foránea que referencia el id del departamento en la tabla Departamentos; elimina el registro si el departamento es eliminado
);



-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- TABLAS INTERMEDIAS (RELACIONES)
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


-- Tabla CLI_CONT: Tabla intermedia que almacena la relación entre clientes y contratos
CREATE TABLE CLI_CONT (
    id_cliente       VARCHAR(9) NOT NULL,            -- Identificador del cliente, no puede ser nulo
    id_contrato      VARCHAR(9) NOT NULL,            -- Identificador del contrato, no puede ser nulo

    CONSTRAINT PK_CLI_CONT PRIMARY KEY (id_cliente, id_contrato), -- Clave primaria compuesta por id_cliente y id_contrato
    CONSTRAINT FK_CLI_CONT_Clientes FOREIGN KEY (id_cliente) REFERENCES Clientes(cedula), -- Clave foránea que referencia la cédula en la tabla Clientes
    CONSTRAINT FK_CLI_CONT_Contratos FOREIGN KEY (id_contrato) REFERENCES Contratos(id_contrato) -- Clave foránea que referencia el id_contrato en la tabla Contratos
);


-- Tabla A_C: Tabla intermedia que almacena la relación entre agentes y contratos
CREATE TABLE A_C (
    id_agente       VARCHAR(9) NOT NULL,            -- Identificador del agente, no puede ser nulo
    id_contrato     VARCHAR(9) NOT NULL,            -- Identificador del contrato, no puede ser nulo

    CONSTRAINT PK_A_C PRIMARY KEY (id_agente, id_contrato), -- Clave primaria compuesta por id_agente y id_contrato
    CONSTRAINT FK_A_C_Agentes FOREIGN KEY (id_agente) REFERENCES Agentes(cedula), -- Clave foránea que referencia la cédula en la tabla Agentes
    CONSTRAINT FK_A_C_Contratos FOREIGN KEY (id_contrato) REFERENCES Contratos(id_contrato) -- Clave foránea que referencia el id_contrato en la tabla Contratos
);

-- Tabla COL_CONT: Tabla intermedia que almacena la relación entre colaboradores y contratos
CREATE TABLE COL_CONT (
    cedula_colaborador VARCHAR(9) NOT NULL,            -- Identificador del colaborador (cédula), no puede ser nulo
    id_contrato        VARCHAR(9) NOT NULL,            -- Identificador del contrato, no puede ser nulo

    CONSTRAINT PK_COL_CONT PRIMARY KEY (cedula_colaborador, id_contrato), -- Clave primaria compuesta por cedula_colaborador y id_contrato
    CONSTRAINT FK_COL_CONT_Colaboradores FOREIGN KEY (cedula_colaborador) REFERENCES Colaboradores(cedula), -- Clave foránea que referencia la cédula en la tabla Colaboradores
    CONSTRAINT FK_COL_CONT_Contratos FOREIGN KEY (id_contrato) REFERENCES Contratos(id_contrato) -- Clave foránea que referencia el id_contrato en la tabla Contratos
);


-- Tabla E_CLI: Tabla intermedia que almacena la relación entre empresas y clientes
CREATE TABLE E_CLI (
    id_empresa VARCHAR(9) NOT NULL,            -- Identificador de la empresa, no puede ser nulo
    id_cliente VARCHAR(9) NOT NULL,            -- Identificador del cliente (cédula), no puede ser nulo

    CONSTRAINT PK_E_CLI PRIMARY KEY (id_empresa, id_cliente), -- Clave primaria compuesta por id_empresa y id_cliente
    CONSTRAINT FK_E_CLI_Empresas FOREIGN KEY (id_empresa) REFERENCES Empresas(id_empresa), -- Clave foránea que referencia el id de la empresa en la tabla Empresas
    CONSTRAINT FK_E_CLI_Clientes FOREIGN KEY (id_cliente) REFERENCES Clientes(cedula) -- Clave foránea que referencia la cédula en la tabla Clientes
);


-- Tabla E_CONT: Tabla intermedia que almacena la relación entre empresas y contratos
CREATE TABLE E_CONT (
    id_contrato      VARCHAR(9) NOT NULL,            -- Identificador del contrato, no puede ser nulo
    id_empresa       VARCHAR(9) NOT NULL,            -- Identificador de la empresa, no puede ser nulo

    CONSTRAINT PK_E_CONT PRIMARY KEY (id_contrato, id_empresa), -- Clave primaria compuesta por id_contrato y id_empresa
    CONSTRAINT FK_E_CONT_Contratos FOREIGN KEY (id_contrato) REFERENCES Contratos(id_contrato), -- Clave foránea que referencia el id_contrato en la tabla Contratos
    CONSTRAINT FK_E_CONT_Empresas FOREIGN KEY (id_empresa) REFERENCES Empresas(id_empresa) -- Clave foránea que referencia el id de la empresa en la tabla Empresas
);


-- Tabla A_DOC: Tabla intermedia que almacena la relación entre agentes y documentación
CREATE TABLE A_DOC (
    id_agente     VARCHAR(9) NOT NULL,            -- Identificador del agente (cédula), no puede ser nulo
    id_documento  VARCHAR(9) NOT NULL,            -- Identificador del documento, no puede ser nulo

    CONSTRAINT PK_A_DOC PRIMARY KEY (id_agente, id_documento), -- Clave primaria compuesta por id_agente y id_documento
    CONSTRAINT FK_A_DOC_Agentes FOREIGN KEY (id_agente) REFERENCES Agentes(cedula), -- Clave foránea que referencia la cédula en la tabla Agentes
    CONSTRAINT FK_A_DOC_Documentacion FOREIGN KEY (id_documento) REFERENCES Documentacion(id_documento) -- Clave foránea que referencia el id_documento en la tabla Documentacion
);


-- Tabla DEP_CONT: Tabla intermedia que almacena la relación entre departamentos y contratos
CREATE TABLE DEP_CONT (
    id_departamento VARCHAR(9) NOT NULL,            -- Identificador del departamento, no puede ser nulo
    id_contrato     VARCHAR(9) NOT NULL,            -- Identificador del contrato, no puede ser nulo

    CONSTRAINT PK_DEP_CONT PRIMARY KEY (id_departamento, id_contrato), -- Clave primaria compuesta por id_departamento y id_contrato

    CONSTRAINT FK_DEP_CONT_Departamentos FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento)
        ON DELETE CASCADE ON UPDATE CASCADE,        -- Clave foránea que referencia el id_departamento en la tabla Departamentos; elimina o actualiza en cascada

    CONSTRAINT FK_DEP_CONT_Contratos FOREIGN KEY (id_contrato) REFERENCES Contratos(id_contrato)
        ON DELETE CASCADE ON UPDATE CASCADE         -- Clave foránea que referencia el id_contrato en la tabla Contratos; elimina o actualiza en cascada
);


-- Tabla A_R: Tabla intermedia que almacena la relación entre agentes y reuniones
CREATE TABLE A_R (
    id_agente     VARCHAR(9) NOT NULL,            -- Identificador del agente (cédula), no puede ser nulo
    id_reunion    VARCHAR(9) NOT NULL,            -- Identificador de la reunión, no puede ser nulo

    CONSTRAINT PK_AGENTE_REUNION PRIMARY KEY (id_agente, id_reunion), -- Clave primaria compuesta por id_agente y id_reunion

    CONSTRAINT FK_AGENTE_REUNION_Agentes FOREIGN KEY (id_agente) REFERENCES Agentes(cedula)
        ON DELETE CASCADE ON UPDATE CASCADE,     -- Clave foránea que referencia la cédula en la tabla Agentes; elimina o actualiza en cascada

    CONSTRAINT FK_AGENTE_REUNION_Reuniones FOREIGN KEY (id_reunion) REFERENCES Reuniones(id_reunion)
        ON DELETE CASCADE ON UPDATE CASCADE      -- Clave foránea que referencia el id_reunion en la tabla Reuniones; elimina o actualiza en cascada
);


-- Tabla DOC_CONT: Tabla intermedia que almacena la relación entre contratos y documentación
CREATE TABLE DOC_CONT (
    id_contrato    VARCHAR(9) NOT NULL,            -- Identificador del contrato, no puede ser nulo
    id_documento   VARCHAR(9) NOT NULL,            -- Identificador del documento, no puede ser nulo

    CONSTRAINT PK_CONTRATO_DOCUMENTO PRIMARY KEY (id_contrato, id_documento), -- Clave primaria compuesta por id_contrato y id_documento

    CONSTRAINT FK_CONTRATO_DOCUMENTO_Contratos FOREIGN KEY (id_contrato) REFERENCES Contratos(id_contrato)
        ON DELETE CASCADE ON UPDATE CASCADE,      -- Clave foránea que referencia el id_contrato en la tabla Contratos; elimina o actualiza en cascada

    CONSTRAINT FK_CONTRATO_DOCUMENTO_Documentacion FOREIGN KEY (id_documento) REFERENCES Documentacion(id_documento)
        ON DELETE CASCADE ON UPDATE CASCADE       -- Clave foránea que referencia el id_documento en la tabla Documentacion; elimina o actualiza en cascada
);


-- Tabla DOC_REU: Tabla intermedia que almacena la relación entre reuniones y documentación
CREATE TABLE DOC_REU (
    id_reunion    VARCHAR(9) NOT NULL,            -- Identificador de la reunión, no puede ser nulo
    id_documento  VARCHAR(9) NOT NULL,            -- Identificador del documento, no puede ser nulo

    CONSTRAINT PK_REUNION_DOCUMENTO PRIMARY KEY (id_reunion, id_documento), -- Clave primaria compuesta por id_reunion y id_documento

    CONSTRAINT FK_REUNION_DOCUMENTO_Reuniones FOREIGN KEY (id_reunion) REFERENCES Reuniones(id_reunion)
        ON DELETE CASCADE ON UPDATE CASCADE,      -- Clave foránea que referencia el id_reunion en la tabla Reuniones; elimina o actualiza en cascada

    CONSTRAINT FK_REUNION_DOCUMENTO_Documentacion FOREIGN KEY (id_documento) REFERENCES Documentacion(id_documento)
        ON DELETE CASCADE ON UPDATE CASCADE       -- Clave foránea que referencia el id_documento en la tabla Documentacion; elimina o actualiza en cascada
);


-- Tabla DEP_COL: Almacena información sobre los colaboradores asociados a departamentos
CREATE TABLE DEP_COL (
    cedula                      VARCHAR(9) PRIMARY KEY,          -- Número de cédula del colaborador, actúa como clave primaria
    id_departamento             VARCHAR(9) NOT NULL,             -- Identificador del departamento al que pertenece el colaborador, no puede ser nulo
    rol_contrato                VARCHAR(20) NOT NULL,            -- Rol del colaborador en el contrato, no puede ser nulo
    banda                       INT NOT NULL,                    -- Banda salarial o nivel del colaborador, debe ser mayor a 0
    estado                      VARCHAR(9) NOT NULL,             -- Estado del colaborador, puede ser 'Activo' o 'Inactivo'
    fecha_de_incorporacion      DATE DEFAULT GETDATE(),          -- Fecha de incorporación del colaborador, con valor por defecto de la fecha actual

    CONSTRAINT FK_DEP_COL_Departamentos FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento)
        ON DELETE CASCADE ON UPDATE CASCADE,                     -- Clave foránea que referencia id_departamento en la tabla Departamentos; elimina o actualiza en cascada

    CONSTRAINT FK_DEP_COL_Personas FOREIGN KEY (cedula) REFERENCES Personas(cedula), -- Clave foránea que referencia la cédula en la tabla Personas

    CONSTRAINT CHK_estado_Colab CHECK (estado IN ('Activo', 'Inactivo')), -- Verifica que el estado sea 'Activo' o 'Inactivo'
    CONSTRAINT CHK_banda_Colab CHECK (banda > 0),                          -- Verifica que la banda sea mayor a 0
    CONSTRAINT CHK_fecha_incorporacion_Colabora CHECK (fecha_de_incorporacion <= GETDATE()) -- Verifica que la fecha de incorporación no sea futura
);


-- Tabla COLABORADOR_REUNION: Tabla intermedia que almacena la relación entre colaboradores y reuniones
CREATE TABLE COLABORADOR_REUNION (
    id_colaborador    VARCHAR(9) NOT NULL,            -- Identificador del colaborador (cédula), no puede ser nulo
    id_reunion        VARCHAR(9) NOT NULL,            -- Identificador de la reunión, no puede ser nulo

    CONSTRAINT PK_COLABORADOR_REUNION PRIMARY KEY (id_colaborador, id_reunion), -- Clave primaria compuesta por id_colaborador y id_reunion

    CONSTRAINT FK_COLABORADOR_REUNION_Colaboradores FOREIGN KEY (id_colaborador) REFERENCES Colaboradores(cedula)
        ON DELETE CASCADE ON UPDATE CASCADE,         -- Clave foránea que referencia la cédula en la tabla Colaboradores; elimina o actualiza en cascada

    CONSTRAINT FK_COLABORADOR_REUNION_Reuniones FOREIGN KEY (id_reunion) REFERENCES Reuniones(id_reunion)
        ON DELETE CASCADE ON UPDATE CASCADE          -- Clave foránea que referencia el id_reunion en la tabla Reuniones; elimina o actualiza en cascada
);


-- Tabla DEP_R: Tabla intermedia que almacena la relación entre departamentos y reuniones
CREATE TABLE DEP_R (
    id_departamento   VARCHAR(9) NOT NULL,            -- Identificador del departamento, no puede ser nulo
    id_reunion        VARCHAR(9) NOT NULL,            -- Identificador de la reunión, no puede ser nulo

    CONSTRAINT PK_DEPARTAMENTO_REUNION PRIMARY KEY (id_departamento, id_reunion), -- Clave primaria compuesta por id_departamento y id_reunion

    CONSTRAINT FK_DEPARTAMENTO_REUNION_Departamentos FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento)
        ON DELETE CASCADE ON UPDATE CASCADE,         -- Clave foránea que referencia el id_departamento en la tabla Departamentos; elimina o actualiza en cascada

    CONSTRAINT FK_DEPARTAMENTO_REUNION_Reuniones FOREIGN KEY (id_reunion) REFERENCES Reuniones(id_reunion)
        ON DELETE CASCADE ON UPDATE CASCADE          -- Clave foránea que referencia el id_reunion en la tabla Reuniones; elimina o actualiza en cascada
);


-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- TRIGGERS
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


-- Trigger (1) trg_update_contract_status_on_client_inactive:
-- Actualiza el estado de los contratos relacionados cuando el estado de un cliente cambia a 'Inactivo'
CREATE TRIGGER trg_update_contract_status_on_client_inactive
ON Clientes
AFTER UPDATE
AS
BEGIN
    -- Verifica si en la tabla temporal 'inserted' (que contiene los nuevos datos de la actualización) hay algún registro con estado 'Inactivo'
    IF EXISTS (SELECT * FROM inserted WHERE estado = 'Inactivo')
    BEGIN
        -- Actualiza el estado de los contratos a 'Inactivo' para aquellos que estén relacionados con clientes cuyo estado se actualizó a 'Inactivo'
        UPDATE Contratos
        SET estado = 'Inactivo'
        WHERE cedula_cliente IN (SELECT cedula FROM inserted WHERE estado = 'Inactivo');
    END
END;
GO


SELECT * FROM Clientes
UPDATE Clientes
SET estado = 'Activo'
WHERE cedula = '123456700';


-- Trigger (2) trg_log_document_creation:
-- Registra la creación de nuevos documentos en la tabla Documentacion_Log
CREATE TRIGGER trg_log_document_creation
ON Documentacion
AFTER INSERT
AS
BEGIN
    -- Inserta en la tabla Documentacion_Log los nuevos registros que se hayan agregado a la tabla Documentacion
    INSERT INTO Documentacion_Log (id_documento, tipo)
    SELECT id_documento, tipo FROM inserted; -- Toma los valores de la tabla temporal 'inserted', que contiene los datos recién insertados
END;
GO



-- Trigger 3: Ajustar el conteo de personal en Departamentos al insertar o eliminar un colaborador
CREATE TRIGGER trg_adjust_personal_count
ON Colaboradores
AFTER INSERT, DELETE
AS
BEGIN
    -- Declaración de variables para almacenar el ID del departamento afectado y el ajuste del conteo
    DECLARE @departamento_id VARCHAR(10);
    DECLARE @ajuste INT;

    -- Verificar si hay una operación de inserción en la tabla Colaboradores
    IF EXISTS (SELECT * FROM inserted)
    BEGIN
        -- Obtener el ID del departamento desde la tabla 'inserted' y definir el ajuste como +1
        SET @departamento_id = (SELECT departamento FROM inserted);
        SET @ajuste = 1;  -- Añadiendo un empleado
    END
    -- Verificar si hay una operación de eliminación en la tabla Colaboradores
    ELSE IF EXISTS (SELECT * FROM deleted)
    BEGIN
        -- Obtener el ID del departamento desde la tabla 'deleted' y definir el ajuste como -1
        SET @departamento_id = (SELECT departamento FROM deleted);
        SET @ajuste = -1; -- Eliminando un empleado
    END

    -- Actualizar la cantidad de personal en la tabla Departamentos
    UPDATE Departamentos
    SET cantidad_personal = cantidad_personal + @ajuste
    WHERE id_departamento = @departamento_id;
END;
GO

-- Actualización del trigger para mejorar la lógica de ajuste del conteo de personal
ALTER TRIGGER trg_adjust_personal_count
ON Colaboradores
AFTER INSERT, DELETE
AS
BEGIN
    -- Declaración de la variable para definir el ajuste
    DECLARE @ajuste INT;

    -- Verificar si hay inserciones y actualizar la cantidad de personal
    IF EXISTS (SELECT * FROM inserted)
    BEGIN
        SET @ajuste = 1;  -- Añadiendo un empleado
        UPDATE Departamentos
        SET cantidad_personal = cantidad_personal + @ajuste
        WHERE id_departamento IN (SELECT departamento FROM inserted);
    END

    -- Verificar si hay eliminaciones y actualizar la cantidad de personal
    IF EXISTS (SELECT * FROM deleted)
    BEGIN
        SET @ajuste = -1; -- Eliminando un empleado
        UPDATE Departamentos
        SET cantidad_personal = cantidad_personal + @ajuste
        WHERE id_departamento IN (SELECT departamento FROM deleted);
    END
END;
GO



-- Trigger 4: Validar programación de reuniones según el estado de contratos del agente
CREATE TRIGGER trg_validate_reunion_scheduling
ON Reuniones
INSTEAD OF INSERT
AS
BEGIN
    -- Declaración de variables para almacenar el ID del agente y el conteo de contratos activos
    DECLARE @agente_id VARCHAR(9);
    DECLARE @contratos_activos INT;

    -- Obtener el ID del agente de la tabla 'inserted'
    SELECT @agente_id = agente_acargo FROM inserted;

    -- Contar la cantidad de contratos activos asociados al agente
    SET @contratos_activos = (
        SELECT COUNT(*)
        FROM Contratos
        WHERE cedula_cliente = @agente_id AND estado = 'Activo'
    );

    -- Verificar si el agente tiene al menos un contrato activo
    IF @contratos_activos > 0
    BEGIN
        -- Insertar la nueva reunión en la tabla 'Reuniones' si el agente tiene contratos activos
        INSERT INTO Reuniones (id_reunion, titulo, descripcion, fecha, hora, estado, modalidad, agente_acargo)
        SELECT id_reunion, titulo, descripcion, fecha, hora, estado, modalidad, agente_acargo FROM inserted;
    END
    ELSE
    BEGIN
        -- Generar un error si el agente no tiene contratos activos
        RAISERROR('No se puede programar una reunión para un agente con todos sus contratos inactivos.', 16, 1);
    END
END;
GO


-- Trigger 5: Actualizar el conteo de contratos asignados a un agente
CREATE TRIGGER trg_update_agent_contract_count
ON Contratos
AFTER INSERT, DELETE
AS
BEGIN
    -- Declaración de la variable para almacenar el ID del agente
    DECLARE @agent_id VARCHAR(9);

    -- Verificar si la operación es una inserción
    IF EXISTS (SELECT * FROM inserted)
    BEGIN
        -- Obtener el ID del agente de la tabla 'inserted'
        SELECT @agent_id = cedula_cliente FROM inserted;
    END
    -- Verificar si la operación es una eliminación
    ELSE IF EXISTS (SELECT * FROM deleted)
    BEGIN
        -- Obtener el ID del agente de la tabla 'deleted'
        SELECT @agent_id = cedula_cliente FROM deleted;
    END

    -- Actualizar el número de contratos asignados al agente en la tabla 'Agentes'
    UPDATE Agentes
    SET numero_de_contratos_asignados = (
        SELECT COUNT(*)
        FROM Contratos
        WHERE cedula_cliente = @agent_id
    )
    WHERE cedula = @agent_id;
END;
GO


-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- VISTAS
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


-- Vista 1: Vista para que los clientes puedan consultar los contratos que están activos
CREATE VIEW Vista_Informacion_Contratos_Clientes AS
SELECT 
    p.cedula,  -- Cédula de la persona (cliente)
    p.nombre,  -- Nombre del cliente
    p.apellido1,  -- Primer apellido del cliente
    c.empresa_asociada,  -- Empresa asociada al cliente
    cl.id_contrato,  -- Identificador del contrato
    cl.fecha_creacion,  -- Fecha de creación del contrato
    cl.fecha_finalizacion,  -- Fecha de finalización del contrato
    cl.estado AS estado_contrato  -- Estado actual del contrato (filtrado por 'Activo')
FROM 
    Personas p  -- Tabla que contiene la información de personas
JOIN 
    Clientes c ON p.cedula = c.cedula  -- Relación entre personas y clientes
JOIN 
    CLI_CONT cc ON c.cedula = cc.id_cliente  -- Uso de la tabla intermedia para unir clientes y contratos
JOIN 
    Contratos cl ON cc.id_contrato = cl.id_contrato  -- Relación entre la tabla intermedia y los contratos
WHERE 
    cl.estado = 'Activo';  -- Filtro para mostrar solo los contratos con estado 'Activo'


-- Consulta de prueba para verificar la vista
SELECT * FROM Vista_Informacion_Contratos_Clientes;



-- Vista 2: Vista para mostrar qué rol tiene cada persona
CREATE VIEW Vista_Empleados_Simplificada AS
-- Selección de personas con rol de 'Administrador'
SELECT 
    p.cedula,  -- Cédula de la persona
    p.nombre,  -- Nombre de la persona
    p.apellido1,  -- Primer apellido de la persona
    'Administrador' AS rol  -- Rol asignado como 'Administrador'
FROM 
    Personas p  -- Tabla de personas
JOIN 
    Administrador a ON p.cedula = a.cedula  -- Relación con la tabla de administradores

UNION ALL

-- Selección de personas con rol de 'Agente'
SELECT 
    p.cedula,  -- Cédula de la persona
    p.nombre,  -- Nombre de la persona
    p.apellido1,  -- Primer apellido de la persona
    'Agente' AS rol  -- Rol asignado como 'Agente'
FROM 
    Personas p  -- Tabla de personas
JOIN 
    Agentes ag ON p.cedula = ag.cedula  -- Relación con la tabla de agentes

UNION ALL

-- Selección de personas con rol de 'Colaborador'
SELECT 
    p.cedula,  -- Cédula de la persona
    p.nombre,  -- Nombre de la persona
    p.apellido1,  -- Primer apellido de la persona
    'Colaborador' AS rol  -- Rol asignado como 'Colaborador'
FROM 
    Personas p  -- Tabla de personas
JOIN 
    Colaboradores c ON p.cedula = c.cedula  -- Relación con la tabla de colaboradores

UNION ALL

-- Selección de personas con rol de 'Cliente'
SELECT 
    p.cedula,  -- Cédula de la persona
    p.nombre,  -- Nombre de la persona
    p.apellido1,  -- Primer apellido de la persona
    'Cliente' AS rol  -- Rol asignado como 'Cliente'
FROM 
    Personas p  -- Tabla de personas
JOIN 
    Clientes cl ON p.cedula = cl.cedula;  -- Relación con la tabla de clientes



-- Consulta de prueba para verificar la vista
SELECT * FROM Vista_Empleados_Simplificada;


-- Vista 3: Resumen de contratos por empresa
CREATE VIEW Vista_Resumen_Contratos_Empresa AS
SELECT 
    c.empresa_asociada,  -- Nombre de la empresa asociada al cliente
    COUNT(CASE WHEN cl.estado = 'Activo' THEN 1 END) AS contratos_activos,  -- Conteo de contratos activos
    COUNT(CASE WHEN cl.estado = 'Inactivo' THEN 1 END) AS contratos_inactivos,  -- Conteo de contratos inactivos
    COUNT(*) AS total_contratos  -- Conteo total de contratos
FROM 
    Clientes c  -- Tabla de clientes
JOIN 
    CLI_CONT cc ON c.cedula = cc.id_cliente  -- Relación con la tabla intermedia de clientes y contratos
JOIN 
    Contratos cl ON cc.id_contrato = cl.id_contrato  -- Relación con la tabla de contratos
GROUP BY 
    c.empresa_asociada;  -- Agrupación por la empresa asociada

-- Verificación de la existencia de la vista en el esquema de información
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Vista_Resumen_Contratos_Empresa';

-- Consulta de prueba para verificar el contenido de la vista
SELECT * FROM Vista_Resumen_Contratos_Empresa;


-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- DATOS
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


--Consulta de la vista
-- Insertar contratos para los clientes existentes
INSERT INTO Contratos (id_contrato, cedula_cliente, fecha_creacion, fecha_finalizacion, estado)
VALUES 
('C004', '123456781', '2024-01-01', '2025-01-01', 'Activo'),
('C005', '123456781', '2023-07-01', '2024-07-01', 'Inactivo'),
('C006', '123456789', '2024-02-01', '2025-02-01', 'Activo'),
('C007', '123456789', '2023-09-01', '2024-09-01', 'Inactivo');


-- Insertar contratos para los nuevos clientes
INSERT INTO Contratos (id_contrato, cedula_cliente, fecha_creacion, fecha_finalizacion, estado)
VALUES 
('C008', '123456784', '2024-03-01', '2025-03-01', 'Activo'),
('C009', '123456784', '2023-05-01', '2024-05-01', 'Inactivo'),
('C010', '123456785', '2024-04-01', '2025-04-01', 'Activo'),
('C011', '123456786', '2023-06-01', '2024-06-01', 'Inactivo'),
('C012', '123456787', '2024-07-01', '2025-07-01', 'Activo'),
('C013', '123456788', '2024-08-01', '2025-08-01', 'Activo');


-- Asociar los contratos a los clientes
INSERT INTO CLI_CONT (id_cliente, id_contrato)
VALUES 
('123456781', 'C004'),
('123456781', 'C005'),
('123456789', 'C006'),
('123456789', 'C007'),
('123456784', 'C008'),
('123456784', 'C009'),
('123456785', 'C010'),
('123456786', 'C011'),
('123456787', 'C012'),
('123456788', 'C013');


SELECT * FROM Vista_Resumen_Contratos_Empresa;


DROP VIEW IF EXISTS Vista_Informacion_Contratos_Clientes;
DROP VIEW IF EXISTS Vista_Empleados_Simplificada;
DROP VIEW IF EXISTS Vista_Resumen_Actividad_Clientes


-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- PROCEDIMIENTOS
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


-- Procedimiento almacenado: InsertarPersona
-- Propósito: Insertar una nueva persona en la tabla Personas con validaciones previas
CREATE PROCEDURE InsertarPersona
    @cedula VARCHAR(9),  -- Cédula de la persona (clave primaria)
    @nombre VARCHAR(15),  -- Nombre de la persona
    @apellido1 VARCHAR(15),  -- Primer apellido de la persona
    @apellido2 VARCHAR(15) = NULL,  -- Segundo apellido de la persona, opcional
    @genero CHAR(1),  -- Género de la persona (debe ser 'F' o 'M')
    @direccion VARCHAR(200)  -- Dirección de la persona
AS
BEGIN
    -- Verificar si la cédula ya existe en la tabla
    IF EXISTS (SELECT 1 FROM Personas WHERE cedula = @cedula)
    BEGIN
        PRINT 'Error: La cédula ya existe en la base de datos.'  -- Mensaje de error si la cédula ya está registrada
        RETURN  -- Termina la ejecución del procedimiento
    END

    -- Verificar si el género es válido
    IF @genero NOT IN ('F', 'M')
    BEGIN
        PRINT 'Error: El género debe ser F o M.'  -- Mensaje de error si el género no es válido
        RETURN  -- Termina la ejecución del procedimiento
    END

    -- Verificar si los nombres y apellidos son alfabéticos
    IF @nombre NOT LIKE '[A-Za-z]%' OR @apellido1 NOT LIKE '[A-Za-z]%'
    BEGIN
        PRINT 'Error: El nombre y el primer apellido deben comenzar con una letra.'  -- Mensaje de error si el nombre o apellido1 no son alfabéticos
        RETURN  -- Termina la ejecución del procedimiento
    END

    IF @apellido2 IS NOT NULL AND @apellido2 NOT LIKE '[A-Za-z]%'
    BEGIN
        PRINT 'Error: El segundo apellido debe comenzar con una letra si se proporciona.'  -- Mensaje de error si apellido2 no es alfabético
        RETURN  -- Termina la ejecución del procedimiento
    END

    -- Inserción en la tabla Personas
    INSERT INTO Personas (cedula, nombre, apellido1, apellido2, genero, direccion)
    VALUES (@cedula, @nombre, @apellido1, @apellido2, @genero, @direccion)  -- Inserta los datos proporcionados

    PRINT 'Persona insertada exitosamente.'  -- Mensaje de confirmación
END;


--Probando
EXEC InsertarPersona '123456789', 'Juan', 'Pérez', 'Gómez', 'M', 'Calle Falsa 123, Ciudad';
EXEC InsertarPersona '123456780', 'Maria', 'Lopez', 'Gonzalez', 'F', 'Avenida Siempre Viva 456, Ciudad';
EXEC InsertarPersona '123456781', 'Carlos', 'Martinez', 'Sanchez', 'M', 'Calle Principal 789, Ciudad';
EXEC InsertarPersona '123456782', 'Ana', 'Fernandez', 'Hernandez', 'F', 'Boulevard Central 101, Ciudad';
EXEC InsertarPersona '123456783', 'Luis', 'Ramirez', 'Vega', 'M', 'Pasaje Los Olivos 202, Ciudad';
EXEC InsertarPersona '123456784', 'Elena', 'Rodriguez', 'Mora', 'F', 'Calle Las Rosas 123, Ciudad';
EXEC InsertarPersona '123456785', 'Pedro', 'Gomez', 'Torres', 'M', 'Avenida Los Pinos 789, Ciudad';
EXEC InsertarPersona '123456786', 'Sofia', 'Jimenez', 'Castro', 'F', 'Calle Central 456, Ciudad';
EXEC InsertarPersona '123456787', 'Miguel', 'Hernandez', 'Ruiz', 'M', 'Pasaje Los Jazmines 890, Ciudad';
EXEC InsertarPersona '123456788', 'Laura', 'Sanchez', 'Gutierrez', 'F', 'Boulevard Los Sauces 321, Ciudad';


SELECT * FROM Personas


-- Procedimiento almacenado: BorrarPersona
-- Propósito: Eliminar una persona de la base de datos y todos los registros relacionados en tablas dependientes
CREATE PROCEDURE BorrarPersona
    @cedula VARCHAR(9)  -- Cédula de la persona a eliminar
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;  -- Iniciar una transacción para garantizar consistencia

        -- Verificar si la cédula existe en la tabla Personas
        IF NOT EXISTS (SELECT 1 FROM Personas WHERE cedula = @cedula)
        BEGIN
            PRINT 'Error: La cédula no existe en la base de datos.';  -- Mensaje de error si la cédula no está en la tabla Personas
            ROLLBACK TRANSACTION;  -- Revertir la transacción
            RETURN;  -- Terminar la ejecución del procedimiento
        END

        -- Eliminar registros relacionados en las tablas dependientes
        DELETE FROM CLI_CONT WHERE id_cliente = @cedula;  -- Eliminar registros en la tabla intermedia CLI_CONT
        DELETE FROM A_C WHERE id_agente = @cedula;  -- Eliminar registros en la tabla A_C
        DELETE FROM COL_CONT WHERE cedula_colaborador = @cedula;  -- Eliminar registros en la tabla COL_CONT
        DELETE FROM A_DOC WHERE id_agente = @cedula;  -- Eliminar registros en la tabla A_DOC
        DELETE FROM A_R WHERE id_agente = @cedula;  -- Eliminar registros en la tabla A_R
        DELETE FROM COLABORADOR_REUNION WHERE id_colaborador = @cedula;  -- Eliminar registros en la tabla COLABORADOR_REUNION
        DELETE FROM DEP_COL WHERE cedula = @cedula;  -- Eliminar registros en la tabla DEP_COL

        DELETE FROM Clientes WHERE cedula = @cedula;  -- Eliminar registros en la tabla Clientes
        DELETE FROM Administrador WHERE cedula = @cedula;  -- Eliminar registros en la tabla Administrador
        DELETE FROM Agentes WHERE cedula = @cedula;  -- Eliminar registros en la tabla Agentes
        DELETE FROM Colaboradores WHERE cedula = @cedula;  -- Eliminar registros en la tabla Colaboradores
        DELETE FROM Telefonos_Personas WHERE cedula = @cedula;  -- Eliminar registros en la tabla Telefonos_Personas

        -- Eliminar de la tabla Personas
        DELETE FROM Personas WHERE cedula = @cedula;  -- Eliminar el registro de la persona

        COMMIT TRANSACTION;  -- Confirmar la transacción si todas las eliminaciones son exitosas
        PRINT 'Persona y todos los registros relacionados eliminados exitosamente.';  -- Mensaje de confirmación
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;  -- Revertir la transacción en caso de error

        PRINT 'Error: Ocurrió un problema al intentar eliminar los registros.';  -- Mensaje de error genérico
        PRINT ERROR_MESSAGE();  -- Mostrar el mensaje de error específico
    END CATCH
END;



DROP PROCEDURE BorrarPersona

BEGIN TRANSACTION;  -- Inicia la transacción

EXEC BorrarPersona '123456789';  -- Ejecuta el procedimiento de borrado

SELECT * FROM Personas;  -- Verifica el estado actual de la tabla

-- Si se decide revertir los cambios:
ROLLBACK;  -- Revierte la transacción
SELECT * FROM Personas;  -- Ve el estado actual de la tabla



-- Procedimiento almacenado: ActualizarDireccion
-- Propósito: Actualizar la dirección de una persona en la tabla Personas
CREATE PROCEDURE ActualizarDireccion
    @cedula VARCHAR(9),  -- Cédula de la persona a actualizar
    @nueva_direccion VARCHAR(200)  -- Nueva dirección de la persona
AS
BEGIN
    -- Verificar si la cédula existe en la tabla Personas
    IF NOT EXISTS (SELECT 1 FROM Personas WHERE cedula = @cedula)
    BEGIN
        PRINT 'Error: La cédula no existe en la base de datos.'  -- Mensaje de error si la cédula no se encuentra
        RETURN  -- Terminar la ejecución del procedimiento
    END

    -- Actualizar la dirección de la persona
    UPDATE Personas
    SET direccion = @nueva_direccion  -- Asignar la nueva dirección
    WHERE cedula = @cedula;  -- Condición para actualizar el registro específico

    PRINT 'Dirección actualizada exitosamente.'  -- Mensaje de confirmación
END;


ActualizarDireccion '123456789','El tec'

Select * from Clientes


-- Procedimiento almacenado: InsertarCliente
-- Propósito: Insertar un nuevo cliente en la tabla Clientes
CREATE PROCEDURE InsertarCliente
    @cedula VARCHAR(9),  -- Cédula de la persona que será insertada como cliente
    @empresa_asociada VARCHAR(40),  -- Empresa asociada al cliente
    @estado VARCHAR(9) = 'Activo'  -- Estado del cliente, por defecto 'Activo'
AS
BEGIN
    -- Verificar si la cédula existe en la tabla Personas
    IF NOT EXISTS (SELECT 1 FROM Personas WHERE cedula = @cedula)
    BEGIN
        PRINT 'Error: La cédula no existe en la tabla Personas.'  -- Mensaje de error si la cédula no se encuentra en la tabla Personas
        RETURN  -- Terminar la ejecución del procedimiento
    END

    -- Verificar si el estado es válido
    IF @estado NOT IN ('Activo', 'Inactivo')
    BEGIN
        PRINT 'Error: El estado debe ser "Activo" o "Inactivo".'  -- Mensaje de error si el estado no es válido
        RETURN  -- Terminar la ejecución del procedimiento
    END

    -- Insertar en la tabla Clientes
    INSERT INTO Clientes (cedula, empresa_asociada, estado)
    VALUES (@cedula, @empresa_asociada, @estado);  -- Insertar los datos proporcionados

    PRINT 'Cliente insertado exitosamente.'  -- Mensaje de confirmación
END;


EXEC InsertarCliente '123456781', 'Microsoft', 'Activo';
-- Insertar clientes asociados a las nuevas personas
EXEC InsertarCliente '123456784', 'TechCorp', 'Activo';
EXEC InsertarCliente '123456785', 'Innovate Solutions', 'Activo';
EXEC InsertarCliente '123456786', 'SmartWare', 'Inactivo';
EXEC InsertarCliente '123456787', 'BuildCon', 'Activo';
EXEC InsertarCliente '123456788', 'EcoSystems', 'Activo';

SELECT * FROM Clientes;
Select * from Personas


-- Procedimiento almacenado: InsertarColaborador
-- Propósito: Insertar un nuevo colaborador en la tabla Colaboradores
CREATE PROCEDURE InsertarColaborador
    @cedula VARCHAR(9),  -- Cédula de la persona que será insertada como colaborador
    @departamento VARCHAR(20),  -- Departamento al que se asignará el colaborador
    @rol_contrato VARCHAR(20),  -- Rol o posición del colaborador en el contrato
    @banda INT,  -- Banda salarial o nivel del colaborador
    @estado VARCHAR(9) = 'Activo'  -- Estado del colaborador, por defecto 'Activo'
AS
BEGIN
    -- Verificar si la cédula existe en la tabla Personas
    IF NOT EXISTS (SELECT 1 FROM Personas WHERE cedula = @cedula)
    BEGIN
        PRINT 'Error: La cédula no existe en la tabla Personas.'  -- Mensaje de error si la cédula no se encuentra en la tabla Personas
        RETURN  -- Terminar la ejecución del procedimiento
    END

    -- Verificar si el estado es válido
    IF @estado NOT IN ('Activo', 'Inactivo')
    BEGIN
        PRINT 'Error: El estado debe ser "Activo" o "Inactivo".'  -- Mensaje de error si el estado no es válido
        RETURN  -- Terminar la ejecución del procedimiento
    END

    -- Verificar si la banda es válida
    IF @banda <= 0
    BEGIN
        PRINT 'Error: La banda debe ser mayor a 0.'  -- Mensaje de error si la banda es menor o igual a 0
        RETURN  -- Terminar la ejecución del procedimiento
    END

    -- Insertar en la tabla Colaboradores
    INSERT INTO Colaboradores (cedula, departamento, rol_contrato, banda, estado)
    VALUES (@cedula, @departamento, @rol_contrato, @banda, @estado);  -- Insertar los datos proporcionados

    PRINT 'Colaborador insertado exitosamente.'  -- Mensaje de confirmación
END;

EXEC InsertarColaborador '123456780', 'IT', 'Desarrollador', 5, 'Activo';
SELECT * FROM Colaboradores;


-- Procedimiento almacenado: InsertarAgente
-- Propósito: Insertar un nuevo agente en la tabla Agentes
CREATE PROCEDURE InsertarAgente
    @cedula VARCHAR(9),  -- Cédula de la persona que será insertada como agente
    @estado VARCHAR(9) = 'Activo',  -- Estado del agente, por defecto 'Activo'
    @numero_de_contratos_asignados TINYINT = 0,  -- Número de contratos asignados al agente, por defecto 0
    @reuniones_asociadas TINYINT = 0,  -- Número de reuniones asociadas al agente, por defecto 0
    @contratos_asociados TINYINT = 0  -- Número de contratos asociados al agente, por defecto 0
AS
BEGIN
    -- Verificar si la cédula existe en la tabla Personas
    IF NOT EXISTS (SELECT 1 FROM Personas WHERE cedula = @cedula)
    BEGIN
        PRINT 'Error: La cédula no existe en la tabla Personas.'  -- Mensaje de error si la cédula no se encuentra en la tabla Personas
        RETURN  -- Terminar la ejecución del procedimiento
    END

    -- Verificar si el estado es válido
    IF @estado NOT IN ('Activo', 'Inactivo')
    BEGIN
        PRINT 'Error: El estado debe ser "Activo" o "Inactivo".'  -- Mensaje de error si el estado no es válido
        RETURN  -- Terminar la ejecución del procedimiento
    END

    -- Insertar en la tabla Agentes
    INSERT INTO Agentes (cedula, estado, numero_de_contratos_asignados, reuniones_asociadas, contratos_asociados)
    VALUES (@cedula, @estado, @numero_de_contratos_asignados, @reuniones_asociadas, @contratos_asociados);  -- Insertar los datos proporcionados

    PRINT 'Agente insertado exitosamente.'  -- Mensaje de confirmación
END;


EXEC InsertarAgente '123456782', 'Activo', 2, 3, 1;


SELECT * FROM Personas;
Select * from Clientes;
SELECT * FROM Agentes;
SELECT * FROM Colaboradores;
SELECT * FROM Vista_Resumen_Contratos_Empresa


INSERT INTO Personas (cedula, nombre, apellido1, apellido2, genero, direccion)
VALUES 
('123456700', 'Diego', 'Alvarado', 'Hernandez', 'M', 'Calle Magnolia 123, San Pedro'),
('123456701', 'Patricia', 'Guzman', 'Jimenez', 'F', 'Avenida del Sol 456, Heredia'),
('123456702', 'Antonio', 'Soto', 'Castro', 'M', 'Pasaje Flores 789, Alajuela'),
('123456703', 'Beatriz', 'Diaz', 'Monge', 'F', 'Boulevard Las Palmas 321, San José'),
('123456704', 'Mario', 'Rojas', 'Mejia', 'M', 'Calle Los Robles 111, Cartago'),
('123456705', 'Camila', 'Fernandez', 'Zamora', 'F', 'Avenida Las Rosas 222, Liberia'),
('123456706', 'Oscar', 'Perez', 'Garcia', 'M', 'Pasaje Los Pinos 333, Puntarenas'),
('123456707', 'Fernanda', 'Ramirez', 'Mendez', 'F', 'Calle Laurel 444, Limón'),
('123456708', 'Roberto', 'Campos', 'Solano', 'M', 'Avenida Central 555, Heredia'),
('123456709', 'Valeria', 'Sanchez', 'Morales', 'F', 'Boulevard Azul 666, Nicoya'),
('123456710', 'Lucas', 'Mora', 'Vargas', 'M', 'Calle Real 777, Palmares');


-- Insertar clientes
INSERT INTO Clientes (cedula, empresa_asociada, estado)
VALUES 
('123456700', 'Tech Solutions', 'Activo'),
('123456702', 'GreenTech', 'Inactivo'),
('123456705', 'Future Enterprises', 'Activo'),
('123456708', 'Urban Builders', 'Activo'),
('123456709', 'EcoSystems Ltd.', 'Inactivo');


-- Insertar colaboradores
INSERT INTO Colaboradores (cedula, departamento, rol_contrato, banda, estado)
VALUES 
('123456701', 'Desarrollo', 'Ingeniero', 3, 'Activo'),
('123456704', 'Recursos Humanos', 'Analista', 2, 'Activo'),
('123456706', 'Soporte Tecnico', 'Soporte', 1, 'Inactivo'),
('123456710', 'Marketing', 'Asesor de Ventas', 4, 'Activo');


-- Insertar agentes
INSERT INTO Agentes (cedula, estado, numero_de_contratos_asignados, reuniones_asociadas, contratos_asociados)
VALUES 
('123456700', 'Activo', 2, 3, 1),
('123456703', 'Activo', 1, 1, 0),
('123456707', 'Inactivo', 0, 0, 0),
('123456709', 'Activo', 3, 4, 2);


SELECT * FROM Vista_Resumen_Contratos_Empresa
SELECT * FROM Vista_Informacion_Contratos_Clientes


-- Insertar contratos para los nuevos clientes
INSERT INTO Contratos (id_contrato, cedula_cliente, fecha_creacion, fecha_finalizacion, estado)
VALUES 
('C014', '123456701', '2023-01-01', '2024-01-01', 'Activo'),
('C015', '123456702', '2023-02-01', '2024-02-01', 'Inactivo'),
('C016', '123456703', '2024-03-01', '2025-03-01', 'Activo'),
('C017', '123456704', '2023-04-01', '2024-04-01', 'Inactivo'),
('C018', '123456705', '2024-05-01', '2025-05-01', 'Activo'),
('C019', '123456706', '2023-06-01', '2024-06-01', 'Inactivo'),
('C020', '123456707', '2024-07-01', '2025-07-01', 'Activo'),
('C021', '123456708', '2023-08-01', '2024-08-01', 'Inactivo'),
('C022', '123456709', '2024-09-01', '2025-09-01', 'Activo'),
('C023', '123456710', '2023-10-01', '2024-10-01', 'Inactivo');

-- Asociar los contratos a los nuevos clientes
INSERT INTO CLI_CONT (id_cliente, id_contrato)
VALUES 
('123456700', 'C014'),
('123456700', 'C015'),
('123456702', 'C016'),
('123456702', 'C017'),
('123456705', 'C018'),
('123456705', 'C019'),
('123456708', 'C020'),
('123456708', 'C021'),
('123456709', 'C022'),
('123456709', 'C023');



--Cursor para reporte de colaboradores
CREATE PROCEDURE Cursor_ReporteColaboradores
AS
BEGIN
    DECLARE cursor_colaboradores CURSOR FOR
    SELECT c.cedula, c.nombre, c.apellido1, col.departamento, col.rol_contrato
    FROM Personas c
    JOIN Colaboradores col ON c.cedula = col.cedula;

    OPEN cursor_colaboradores;

    DECLARE @cedula VARCHAR(9);
    DECLARE @nombre VARCHAR(15);
    DECLARE @apellido1 VARCHAR(15);
    DECLARE @departamento VARCHAR(20);
    DECLARE @rol_contrato VARCHAR(20);

    CREATE TABLE #TempColaboradores (
        cedula VARCHAR(9),
        nombre VARCHAR(15),
        apellido1 VARCHAR(15),
        departamento VARCHAR(20),
        rol_contrato VARCHAR(20)
    );

    FETCH NEXT FROM cursor_colaboradores INTO @cedula, @nombre, @apellido1, @departamento, @rol_contrato;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        INSERT INTO #TempColaboradores VALUES (@cedula, @nombre, @apellido1, @departamento, @rol_contrato);

        FETCH NEXT FROM cursor_colaboradores INTO @cedula, @nombre, @apellido1, @departamento, @rol_contrato;
    END;

    SELECT * FROM #TempColaboradores;

    CLOSE cursor_colaboradores;
    DEALLOCATE cursor_colaboradores;
END;
GO


EXEC Cursor_ReporteColaboradores
DROP PROCEDURE Cursor_ReporteColaboradores



--Cursor para reporte de clientes
CREATE PROCEDURE Cursor_ReporteClientes
AS
BEGIN
    DECLARE cursor_clientes CURSOR FOR
    SELECT p.cedula, p.nombre, p.apellido1, c.empresa_asociada, c.estado
    FROM Personas p
    JOIN Clientes c ON p.cedula = c.cedula;

    OPEN cursor_clientes;

    DECLARE @cedula VARCHAR(9);
    DECLARE @nombre VARCHAR(15);
    DECLARE @apellido1 VARCHAR(15);
    DECLARE @empresa_asociada VARCHAR(40);
    DECLARE @estado VARCHAR(9);

    CREATE TABLE #TempClientes (
        cedula VARCHAR(9),
        nombre VARCHAR(15),
        apellido1 VARCHAR(15),
        empresa_asociada VARCHAR(40),
        estado VARCHAR(9)
    );

    FETCH NEXT FROM cursor_clientes INTO @cedula, @nombre, @apellido1, @empresa_asociada, @estado;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        INSERT INTO #TempClientes VALUES (@cedula, @nombre, @apellido1, @empresa_asociada, @estado);

        FETCH NEXT FROM cursor_clientes INTO @cedula, @nombre, @apellido1, @empresa_asociada, @estado;
    END;

    SELECT * FROM #TempClientes;

    CLOSE cursor_clientes;
    DEALLOCATE cursor_clientes;
END;
GO

EXEC Cursor_ReporteClientes 
DROP PROCEDURE Cursor_ReporteClientes



--Cursor para reporte de agentes
CREATE PROCEDURE Cursor_ReporteAgentes
AS
BEGIN
    DECLARE cursor_agentes CURSOR FOR
    SELECT p.cedula, p.nombre, p.apellido1, a.estado, a.numero_de_contratos_asignados, a.reuniones_asociadas
    FROM Personas p
    JOIN Agentes a ON p.cedula = a.cedula;

    OPEN cursor_agentes;

    DECLARE @cedula VARCHAR(9);
    DECLARE @nombre VARCHAR(15);
    DECLARE @apellido1 VARCHAR(15);
    DECLARE @estado VARCHAR(9);
    DECLARE @numero_contratos TINYINT;
    DECLARE @reuniones_asociadas TINYINT;

    CREATE TABLE #TempAgentes (
        cedula VARCHAR(9),
        nombre VARCHAR(15),
        apellido1 VARCHAR(15),
        estado VARCHAR(9),
        numero_de_contratos_asignados TINYINT,
        reuniones_asociadas TINYINT
    );

    FETCH NEXT FROM cursor_agentes INTO @cedula, @nombre, @apellido1, @estado, @numero_contratos, @reuniones_asociadas;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        INSERT INTO #TempAgentes VALUES (@cedula, @nombre, @apellido1, @estado, @numero_contratos, @reuniones_asociadas);

        FETCH NEXT FROM cursor_agentes INTO @cedula, @nombre, @apellido1, @estado, @numero_contratos, @reuniones_asociadas;
    END;

    SELECT * FROM #TempAgentes;

    CLOSE cursor_agentes;
    DEALLOCATE cursor_agentes;
END;
GO

EXEC Cursor_ReporteAgentes
DROP PROCEDURE Cursor_ReporteAgentes