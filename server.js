const express = require('express');
const path = require('path');
const app = express();
const PORT = 9888; 

app.use(express.json());
app.use(express.static('public'));

app.post('/api/stores', (req, res) => {
  console.log('New store:', req.body);
  res.status(201).json(req.body);
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
