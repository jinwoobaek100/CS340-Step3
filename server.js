const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 7878;
const mysql = require('mysql');

app.use(express.json());
app.use(express.static('public'));

// Setting for connection with database
const connection = mysql.createConnection({
  host: 'classmysql.engr.oregonstate.edu',
  user: 'cs340_baekji',
  password: 'your_password',
  database: 'cs340_baekji'
});

// Start Connection
connection.connect((err) => {
  if(err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connection to database with id ' + connection.threadId);
});

// // Function to read JSON file
// const readJSONFile = (filename) => {
//   try {
//     const rawData = fs.readFileSync(path.join(__dirname, filename));
//     return JSON.parse(rawData);
//   } catch (error) {
//     if (error.code === 'ENOENT') {
//       return [];
//     }
//     throw error;
//   }
// };

// // Function to write JSON file
// const writeJSONFile = (filename, data) => {
//   fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 2));
// };

// Function that execute the database function
const executeQuery = (sql, values) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results) => {
      if(error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};

const createCRUDOperations = (entityName, idField) => {
  // Get all entities
  app.get(`/api/${entityName}`, async (req, res, next) => {
      try {
          const sql = `SELECT * FROM ${entityName}`;
          const entities = await executeQuery(sql);
          res.json(entities);
      } catch (error) {
          next(error);
      }
  });

  // Get single entity
  app.get(`/api/${entityName}/:id`, async (req, res, next) => {
      try {
          const id = req.params.id;
          const sql = `SELECT * FROM ${entityName} WHERE ${idField} = ?`;
          const entities = await executeQuery(sql, [id]);
          if (entities.length > 0) {
              res.json(entities[0]);
          } else {
              res.status(404).json({ message: `${entityName} not found` });
          }
      } catch (error) {
          next(error);
      }
  });

  // Create new entity
  app.post(`/api/${entityName}`, async (req, res, next) => {
      try {
          const data = req.body;
          // Construct the SQL query dynamically based on the received data
          const columns = Object.keys(data).join(', ');
          const values = Object.values(data);
          const placeholders = values.map(() => '?').join(', ');

          const sql = `INSERT INTO ${entityName} (${columns}) VALUES (${placeholders})`;
          const result = await executeQuery(sql, values);

          // Respond with the newly created entity (you might want to fetch it again to be sure)
          const newEntityId = result.insertId;  // Assuming your table has an auto-incrementing ID
          const newEntity = await executeQuery(`SELECT * FROM ${entityName} WHERE ${idField} = ?`, [newEntityId]);

          res.status(201).json(newEntity[0]);
      } catch (error) {
          next(error);
      }
  });

  // Update entity
  app.put(`/api/${entityName}/:id`, async (req, res, next) => {
      try {
          const id = req.params.id;
          const data = req.body;

          // Construct the SET part of the SQL query dynamically
          const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
          const values = [...Object.values(data), id];

          const sql = `UPDATE ${entityName} SET ${updates} WHERE ${idField} = ?`;
          const result = await executeQuery(sql, values);

          if (result.affectedRows > 0) {
              // Fetch the updated entity and respond with it
              const updatedEntity = await executeQuery(`SELECT * FROM ${entityName} WHERE ${idField} = ?`, [id]);
              res.json(updatedEntity[0]);
          } else {
              res.status(404).json({ message: `${entityName} not found` });
          }
      } catch (error) {
          next(error);
      }
  });

  // Delete entity
  app.delete(`/api/${entityName}/:id`, async (req, res, next) => {
      try {
          const id = req.params.id;
          const sql = `DELETE FROM ${entityName} WHERE ${idField} = ?`;
          const result = await executeQuery(sql, [id]);

          if (result.affectedRows > 0) {
              res.json({ message: `${entityName} deleted successfully` });
          } else {
              res.status(404).json({ message: `${entityName} not found` });
          }
      } catch (error) {
          next(error);
      }
  });
};

// Create CRUD operations for all tables
createCRUDOperations('stores', 'storeID');
createCRUDOperations('customers', 'customerID');
createCRUDOperations('menuitems', 'menuID');
createCRUDOperations('orders', 'orderID');
createCRUDOperations('phones', 'phoneID');
createCRUDOperations('orderitems', 'orderItemID');
createCRUDOperations('positions', 'positionID');
createCRUDOperations('employees', 'employeeID');
createCRUDOperations('storepositions', 'storePositionID');

// SPA catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    message: 'Internal Server Error',
    error: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://classwork.engr.oregonstate.edu:${PORT}`);
});
