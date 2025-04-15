const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Created', 'InTransit', 'Delivered'], default: 'Created' },
    blockchainTxHash: { type: String },
    productId: { type: String }, // This is the ID used in the blockchain
    manufacturer: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);