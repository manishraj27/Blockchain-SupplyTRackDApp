const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Product routes
router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id/status', productController.updateProductStatus);
router.get('/:id/history', productController.getProductHistory);
router.delete('/:id', productController.deleteProduct);

module.exports = router;