require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('./db/connection');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],// Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Routes
app.use('/api/products', productRoutes);


// - POST /api/products - Create a new product
// - GET /api/products - Get all products
// - GET /api/products/:id - Get a specific product
// - GET /api/products/:id/history - Get product history
// - PUT /api/products/:id/status - Update product status
// - DELETE /api/products/:id - Delete a product


app.get('/', (req, res) => {
    res.send('Supply Chain Blockchain API');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});