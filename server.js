const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 4567;

app.use(express.json());
app.use(express.static('public'));

// Function to read JSON file
const readJSONFile = (filename) => {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, filename));
    return JSON.parse(rawData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Function to write JSON file
const writeJSONFile = (filename, data) => {
  fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 2));
};

// Generic CRUD operations for all tables
const createCRUDOperations = (entityName, idField) => {
  const filename = `${entityName}.json`;

  // Get all entities
  app.get(`/api/${entityName}`, (req, res, next) => {
    try {
      const entities = readJSONFile(filename);
      res.json(entities);
    } catch (error) {
      next(error);
    }
  });

  // Get single entity
  app.get(`/api/${entityName}/:id`, (req, res, next) => {
    try {
      const entities = readJSONFile(filename);
      const entity = entities.find(e => e[idField] === parseInt(req.params.id));
      if (entity) {
        res.json(entity);
      } else {
        res.status(404).json({ message: `${entityName} not found` });
      }
    } catch (error) {
      next(error);
    }
  });

  // Create new entity
  app.post(`/api/${entityName}`, (req, res) => {
    const entities = readJSONFile(filename);
    const newEntity = {
      [idField]: entities.length > 0 ? Math.max(...entities.map(e => e[idField])) + 1 : 1,
      ...req.body
    };
    entities.push(newEntity);
    writeJSONFile(filename, entities);
    res.status(201).json(newEntity);
  });

  // Update entity
  app.put(`/api/${entityName}/:id`, (req, res) => {
    let entities = readJSONFile(filename);
    const index = entities.findIndex(e => e[idField] === parseInt(req.params.id));
    if (index !== -1) {
      entities[index] = { ...entities[index], ...req.body };
      writeJSONFile(filename, entities);
      res.json(entities[index]);
    } else {
      res.status(404).json({ message: `${entityName} not found` });
    }
  });

  // Delete entity
  app.delete(`/api/${entityName}/:id`, (req, res) => {
    let entities = readJSONFile(filename);
    const filteredEntities = entities.filter(e => e[idField] !== parseInt(req.params.id));
    if (filteredEntities.length < entities.length) {
      writeJSONFile(filename, filteredEntities);
      res.json({ message: `${entityName} deleted successfully` });
    } else {
      res.status(404).json({ message: `${entityName} not found` });
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
