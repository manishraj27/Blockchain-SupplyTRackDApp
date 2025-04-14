const Product = require('../models/Product');
const { contract, account } = require('../utils/blockchain');

const productController = {
    createProduct: async (req, res) => {
        try {
            console.log('Received product data:', req.body);
            
            const product = new Product({
                name: req.body.name,
                description: req.body.description,
                status: 'Created',
                blockchainId: req.body.blockchainId || 1, // Default to 1 if not provided
                blockchainTxHash: req.body.blockchainTxHash,
                manufacturer: req.body.manufacturer
            });

            const savedProduct = await product.save();
            console.log('Saved product:', savedProduct);
            
            res.status(201).json(savedProduct);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ 
                message: 'Error creating product',
                error: error.message 
            });
        }
    },

    getProducts: async (req, res) => {
        try {
            const products = await Product.find().sort({ createdAt: -1 });
            res.json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ 
                message: 'Error fetching products',
                error: error.message 
            });
        }
    },

    updateProductStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Update status in blockchain
            const tx = await contract.methods.updateProductStatus(
                id,
                status
            ).send({ from: account });

            // Update in database
            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                { 
                    status,
                    blockchainTxHash: tx.transactionHash,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json(updatedProduct);
        } catch (error) {
            console.error('Error updating product status:', error);
            res.status(500).json({ 
                message: 'Error updating product status',
                error: error.message 
            });
        }
    },

    getProductHistory: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);
            
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Get blockchain history
            const events = await contract.getPastEvents('StatusUpdated', {
                filter: { productId: id },
                fromBlock: 0
            });

            const history = events.map(event => ({
                status: event.returnValues.status,
                timestamp: new Date(event.returnValues.timestamp * 1000),
                transactionHash: event.transactionHash
            }));

            res.json({
                product,
                history: history.length > 0 ? history : [{
                    status: product.status,
                    timestamp: product.createdAt,
                    transactionHash: product.blockchainTxHash
                }]
            });
        } catch (error) {
            console.error('Error fetching product history:', error);
            res.status(500).json({ 
                message: 'Error fetching product history',
                error: error.message 
            });
        }
    },

    getProductById: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);
            
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Get blockchain data
            const blockchainProduct = await contract.methods.getProduct(id).call();

            res.json({
                ...product.toObject(),
                blockchainData: blockchainProduct
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({ 
                message: 'Error fetching product',
                error: error.message 
            });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Delete from blockchain
            await contract.methods.deleteProduct(id).send({ from: account });
            
            // Delete from database
            const deletedProduct = await Product.findByIdAndDelete(id);
            
            if (!deletedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ 
                message: 'Error deleting product',
                error: error.message 
            });
        }
    }
};

module.exports = productController;