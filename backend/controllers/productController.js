const Product = require('../models/Product');
const { contract, account } = require('../utils/blockchain');

const productController = {
    createProduct: async (req, res) => {
        try {
            console.log('Received product data:', req.body);
            
            // Check if blockchain transaction was already performed
            if (!req.body.blockchainId || !req.body.blockchainTxHash) {
                return res.status(400).json({ 
                    message: 'Missing blockchain transaction details'
                });
            }
            
            // Create product in database using the blockchain data from frontend
            const product = new Product({
                name: req.body.name,
                description: req.body.description,
                status: 'Created',
                blockchainId: req.body.blockchainId,
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
            
            // Convert string status to numeric value for the blockchain
            const statusMap = {
                'Created': 0,
                'InTransit': 1,
                'Delivered': 2
            };

            const numericStatus = statusMap[status];
            if (numericStatus === undefined) {
                return res.status(400).json({ message: 'Invalid status. Must be Created, InTransit, or Delivered' });
            }

            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Update status in blockchain
            const tx = await contract.methods.updateProductStatus(
                product.blockchainId,
                numericStatus
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
            const statusEvents = await contract.getPastEvents('StatusUpdated', {
                filter: { productId: product.blockchainId },
                fromBlock: 0
            });

            const creationEvents = await contract.getPastEvents('ProductCreated', {
                filter: { productId: product.blockchainId },
                fromBlock: 0
            });
            
            const statusMap = {
                0: 'Created',
                1: 'InTransit',
                2: 'Delivered'
            };
            
            // Process status update events
            const statusHistory = statusEvents.map(event => ({
                status: statusMap[event.returnValues.status],
                timestamp: new Date(parseInt(event.returnValues.timestamp) * 1000),
                transactionHash: event.transactionHash
            }));
            
            // Process creation event
            let history = [];
            if (creationEvents.length > 0) {
                const creationEvent = creationEvents[0];
                history.push({
                    status: 'Created',
                    timestamp: new Date(parseInt(creationEvent.returnValues.timestamp) * 1000),
                    transactionHash: creationEvent.transactionHash
                });
            }
            
            // Combine and sort by timestamp
            history = [...history, ...statusHistory].sort((a, b) => a.timestamp - b.timestamp);

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
            const blockchainProduct = await contract.methods.getProduct(product.blockchainId).call();
            
            // Convert numeric status to string
            const statusMap = {
                0: 'Created',
                1: 'InTransit',
                2: 'Delivered'
            };

            res.json({
                ...product.toObject(),
                blockchainData: {
                    ...blockchainProduct,
                    status: statusMap[blockchainProduct.status]
                }
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
            const product = await Product.findById(id);
            
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            
            // Delete from blockchain
            await contract.methods.deleteProduct(product.blockchainId).send({ from: account });
            
            // Delete from database
            const deletedProduct = await Product.findByIdAndDelete(id);
            
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