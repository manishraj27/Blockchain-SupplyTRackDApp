// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    enum Status { Created, InTransit, Delivered }
    
    struct Product {
        uint256 id;
        string name;
        string description;
        address manufacturer;
        Status status;
        uint256 timestamp;
        bool exists;
    }

    mapping(uint256 => Product) public products;
    uint256 public productCount;

    event ProductCreated(uint256 indexed productId, string name, address manufacturer, uint256 timestamp);
    event StatusUpdated(uint256 indexed productId, Status status, uint256 timestamp);

    function createProduct(string memory _name, string memory _description) public returns (uint256) {
        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _description,
            msg.sender,
            Status.Created,
            block.timestamp,
            true
        );
        emit ProductCreated(productCount, _name, msg.sender, block.timestamp);
        return productCount;
    }

    function updateProductStatus(uint256 _id, uint8 _status) public {
        require(_id <= productCount, "Product does not exist");
        require(products[_id].exists, "Product has been deleted");
        require(_status <= 2, "Invalid status value");
        
        Product storage product = products[_id];
        product.status = Status(_status);
        product.timestamp = block.timestamp;
        
        emit StatusUpdated(_id, Status(_status), block.timestamp);
    }
    
    function getProduct(uint256 _id) public view returns (
        uint256 id,
        string memory name,
        string memory description,
        address manufacturer,
        uint8 status,
        uint256 timestamp,
        bool exists
    ) {
        require(_id <= productCount, "Product does not exist");
        Product storage product = products[_id];
        
        return (
            product.id,
            product.name,
            product.description,
            product.manufacturer,
            uint8(product.status),
            product.timestamp,
            product.exists
        );
    }
    
    function deleteProduct(uint256 _id) public {
        require(_id <= productCount, "Product does not exist");
        require(products[_id].exists, "Product already deleted");
        
        products[_id].exists = false;
    }
}