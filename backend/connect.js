import { open } from 'msnodesqlv8';

// Configura la cadena de conexión
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=SAMPLE;Trusted_Connection=yes;';

open(connectionString, (err, conn) => {
  if (err) {
    console.log("Error al conectar: ", err);
  } else {
    console.log("Conectado");
  }
});

// Función para insertar un nuevo cliente
function insertCustomer(firstName, lastName, email, phone) {
  const query = `INSERT INTO Customers (FirstName, LastName, Email, Phone) 
                 OUTPUT INSERTED.CustomerID 
                 VALUES (?, ?, ?, ?);`;

  open(connectionString, (err, conn) => {
    if (err) {
      console.log("Error al conectar: ", err);
      return;
    }

    // Insertar el cliente
    conn.query(query, [firstName, lastName, email, phone], (err, result) => {
      if (err) {
        console.log("Error al insertar cliente: ", err);
      } else {
        const customerId = result[0].CustomerID;
        console.log(`Cliente insertado con ID: ${customerId}`);

        // Después de insertar el cliente, insertar un pedido
        insertOrder(customerId, 150.00); // Ejemplo de pedido con monto de $150
      }
    });
  });
}

// Función para insertar un pedido asociado a un cliente
function insertOrder(customerId, amount) {
  const query = `INSERT INTO Orders (CustomerID, Amount) VALUES (?, ?);`;

  open(connectionString, (err, conn) => {
    if (err) {
      console.log("Error al conectar: ", err);
      return;
    }

    // Insertar el pedido
    conn.query(query, [customerId, amount], (err, result) => {
      if (err) {
        console.log("Error al insertar pedido: ", err);
      } else {
        console.log("Pedido insertado con éxito.");
      }
    });
  });
}

// Función para actualizar la información de un cliente
function updateCustomer(customerId, newEmail, newPhone) {
  const query = `UPDATE Customers SET Email = ?, Phone = ? WHERE CustomerID = ?;`;

  open(connectionString, (err, conn) => {
    if (err) {
      console.log("Error al conectar: ", err);
      return;
    }

    // Actualizar los datos del cliente
    conn.query(query, [newEmail, newPhone, customerId], (err, result) => {
      if (err) {
        console.log("Error al actualizar cliente: ", err);
      } else {
        console.log(`Cliente con ID ${customerId} actualizado.`);
      }
    });
  });
}

// Ejecutar ejemplos

// 1. Insertar un nuevo cliente y pedido
// insertCustomer('Juan', 'Pérez', 'juan.perez@example.com', '555-1234');

// 2. Actualizar un cliente existente (con ID 1)
// updateCustomer(1, 'HOLA', '555-4321');
