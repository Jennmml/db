import pyodbc

# Datos de conexión
server = 'JONATHAN\\SQLEXPRESS'  # Nombre del servidor
database = 'MYDB'                 # Nombre de la base de datos
username = 'tu_usuario'           # Tu nombre de usuario si usas autenticación SQL
password = 'tu_contraseña'        # La contraseña si usas autenticación SQL

# Crear la cadena de conexión
connection_string = (
    f'DRIVER={{ODBC Driver 17 for SQL Server}};'  # Asegúrate de tener este driver instalado
    f'SERVER={server};'
    f'DATABASE={database};'
    f'Trusted_Connection=yes;'   # Esto se usa si estás usando autenticación de Windows (sin usuario/contraseña)
)

# Conectar a la base de datos
try:
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()
    
    # Crear (INSERT)
    def insertar_persona(name, age):
        try:
            cursor.execute("""
                INSERT INTO PERSONAS (name, age) 
                VALUES (?, ?)
            """, (name, age))
            conn.commit()  # Confirmar los cambios
            print(f"Persona {name} insertada exitosamente")
        except pyodbc.Error as e:
            print("Error al insertar los datos: ", e)

    # Leer (SELECT)
    def leer_personas():
        try:
            cursor.execute("SELECT * FROM PERSONAS")
            rows = cursor.fetchall()
            print("Listado de personas:")
            for row in rows:
                print(f"ID: {row.id}, Nombre: {row.name}, Edad: {row.age}")
        except pyodbc.Error as e:
            print("Error al leer los datos: ", e)

    # Actualizar (UPDATE)
    def actualizar_edad(name, new_age):
        try:
            cursor.execute("""
                UPDATE PERSONAS 
                SET age = ? 
                WHERE name = ?
            """, (new_age, name))
            conn.commit()  # Confirmar los cambios
            print(f"Edad de {name} actualizada a {new_age}")
        except pyodbc.Error as e:
            print("Error al actualizar los datos: ", e)

    # Eliminar (DELETE)
    def eliminar_persona(name):
        try:
            cursor.execute("""
                DELETE FROM PERSONAS 
                WHERE name = ?
            """, (name,))
            conn.commit()  # Confirmar los cambios
            print(f"Persona {name} eliminada exitosamente")
        except pyodbc.Error as e:
            print("Error al eliminar los datos: ", e)

    # Ejemplo de uso
    print("\n--- Insertar Personas ---")
    insertar_persona('Ana', 28)
    insertar_persona('Luis', 33)

    print("\n--- Leer Personas ---")
    leer_personas()

    print("\n--- Actualizar Edad ---")
    actualizar_edad('Ana', 47)

    print("\n--- Leer Personas Después de Actualizar ---")
    leer_personas()

    print("\n--- Eliminar Persona ---")
    eliminar_persona('Luis')

    print("\n--- Leer Personas Después de Eliminar ---")
    leer_personas()

except pyodbc.Error as e:
    print("Error en la conexión: ", e)

finally:
    # Cerrar la conexión
    if conn:
        conn.close()
