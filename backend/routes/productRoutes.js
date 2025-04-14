const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Create a new product
router.post('/', productController.createProduct);

// Get all products
router.get('/', productController.getProducts);

// Get a specific product by ID
router.get('/:id', productController.getProductById);

// Get product history
router.get('/:id/history', productController.getProductHistory);

// Update product status
router.put('/:id/status', productController.updateProductStatus);

// Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router;