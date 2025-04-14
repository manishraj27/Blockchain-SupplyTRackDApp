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
    }

    mapping(uint256 => Product) public products;
    uint256 public productCount;

    event ProductCreated(uint256 id, string name, address manufacturer);
    event StatusUpdated(uint256 id, Status status);

    function createProduct(string memory _name, string memory _description) public {
        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _description,
            msg.sender,
            Status.Created,
            block.timestamp
        );
        emit ProductCreated(productCount, _name, msg.sender);
    }

    function updateStatus(uint256 _id, Status _status) public {
        require(_id <= productCount, "Product does not exist");
        Product storage product = products[_id];
        product.status = _status;
        emit StatusUpdated(_id, _status);
    }
}