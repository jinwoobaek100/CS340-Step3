const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 4567; 

app.use(express.json());
app.use(express.static('public'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    message: 'Internal Server Error',
    error: err.message
  });
});

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

app.get('/api/stores', (req, res, next) => {
  try {
    const stores = readJSONFile('stores.json');
    res.json(stores);
  } catch (error) {
    next(error);
  }
});

app.put('/api/stores/:id', (req, res) => {
  let stores = readJSONFile('stores.json');
  const index = stores.findIndex(s => s.storeID === parseInt(req.params.id));
  if (index !== -1) {
    stores[index] = { ...stores[index], ...req.body };
    fs.writeFileSync(path.join(__dirname, 'stores.json'), JSON.stringify(stores, null, 2));
    res.json(stores[index]);
  } else {
    res.status(404).json({ message: 'Store not found' });
  }
});

app.delete('/api/stores/:id', (req, res) => {
  let stores = readJSONFile('stores.json');
  const filteredStores = stores.filter(s => s.storeID !== parseInt(req.params.id));
  if (filteredStores.length < stores.length) {
    fs.writeFileSync(path.join(__dirname, 'stores.json'), JSON.stringify(filteredStores, null, 2));
    res.json({ message: 'Store deleted successfully' });
  } else {
    res.status(404).json({ message: 'Store not found' });
  }
});

app.post('/api/stores', (req, res) => {
  const stores = readJSONFile('stores.json');
  const newStore = {
    storeID: stores.length + 1,
    ...req.body
  };
  stores.push(newStore);
  fs.writeFileSync(path.join(__dirname, 'stores.json'), JSON.stringify(stores, null, 2));
  res.status(201).json(newStore);
});

app.post('/api/customers', (req, res) => {
  console.log('New customer:', req.body);
  res.status(201).json(req.body);
});

app.post('/api/employees', (req, res) => {
  console.log('New employee:', req.body);
  res.status(201).json(req.body);
});

app.post('/api/menuitems', (req, res) => {
  console.log('New menu item:', req.body);
  res.status(201).json(req.body);
});

app.post('/api/orders', (req, res) => {
  console.log('New order:', req.body);
  res.status(201).json(req.body);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://classwork.engr.oregonstate.edu:${PORT}`);
});
