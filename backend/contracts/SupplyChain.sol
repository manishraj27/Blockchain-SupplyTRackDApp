// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    // Enum to represent product status
    enum Status { Created, InTransit, Delivered }
    
    // Struct to store product data
    struct Product {
        string productId;
        Status status;
        uint256 timestamp;
        bool exists;
    }
    
    // Mapping from product ID to product data
    mapping(string => Product) public products;
    
    // Events
    event ProductCreated(string productId, uint256 timestamp);
    event StatusUpdated(string productId, Status status, uint256 timestamp);
    event ProductDeleted(string productId, uint256 timestamp);
    
    // Create a new product
    function createProduct(string memory productId) public {
        require(!products[productId].exists, "Product already exists");
        
        products[productId] = Product({
            productId: productId,
            status: Status.Created,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit ProductCreated(productId, block.timestamp);
    }
    
    // Update product status
    function updateProductStatus(string memory productId, Status newStatus) public {
        require(products[productId].exists, "Product does not exist");
        require(newStatus <= Status.Delivered, "Invalid status value");
        
        // Update status
        products[productId].status = newStatus;
        products[productId].timestamp = block.timestamp;
        
        emit StatusUpdated(productId, newStatus, block.timestamp);
    }
    
    // Delete a product
    function deleteProduct(string memory productId) public {
        require(products[productId].exists, "Product does not exist");
        
        delete products[productId];
        
        emit ProductDeleted(productId, block.timestamp);
    }
    
    // Get product details
    function getProduct(string memory productId) public view returns (Status status, uint256 timestamp, bool exists) {
        Product memory product = products[productId];
        return (product.status, product.timestamp, product.exists);
    }
}