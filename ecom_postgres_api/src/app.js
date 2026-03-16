const express = require('express');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');

const app = express();

app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

module.exports = app;