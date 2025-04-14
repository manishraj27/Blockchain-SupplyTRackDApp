# Supply Chain Management with Blockchain

A decentralized supply chain management system built with MERN stack and Ethereum blockchain.

## Features

- Product creation and tracking
- Real-time status updates
- Blockchain integration for transparency
- Secure transaction history
- MetaMask integration

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Blockchain**: Ethereum (Solidity)
- **UI**: Tailwind CSS + shadcn/ui
- **Web3**: ethers.js

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- MetaMask browser extension
- Ganache (for local blockchain)

## Project Structure

term_paper_project/
├── frontend/           # React frontend
├── backend/           # Express backend


## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend

2. Install dependencies:
```bash
npm install
 ```

3. Set up environment variables:
```bash
cp .env

4. Start the server:
```bash
npm run dev
 ```
## Trae AI
Used 1 Reference

The error occurs because we need to update the product creation to properly store and handle the blockchain ID. Let's update the product controller and frontend code:

```javascript
const createProduct = async (req, res) => {
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
};
 ```
```

And update the frontend App.jsx:

```javascript
const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!isMetaMaskInstalled) {
      alert("Please install MetaMask to create products");
      return;
    }

    if (!productName || !description) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (!contract) return;
      
      // Create product in blockchain
      const tx = await contract.createProduct(productName, description);
      const receipt = await tx.wait();
      
      // Get product count from contract
      const productCount = await contract.productCount();
      
      // Create product in backend
      await productApi.createProduct({
        name: productName,
        description: description,
        blockchainId: parseInt(productCount.toString()),
        blockchainTxHash: receipt.hash,
        manufacturer: receipt.from
      });
      
      // Refresh products list
      const response = await productApi.getProducts();
      setProducts(response.data || []);
      
      setProductName("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
};

const handleUpdateStatus = async (product) => {
    try {
      if (!contract) {
        alert("Please connect to MetaMask first");
        return;
      }

      const newStatus = prompt("Enter new status (0: Created, 1: InTransit, 2: Delivered):");
      if (newStatus === null) return;

      const statusNumber = parseInt(newStatus);
      if (![0, 1, 2].includes(statusNumber)) {
        alert("Invalid status. Please use: 0 for Created, 1 for InTransit, or 2 for Delivered");
        return;
      }

      setLoading(true);
      
      // Update status in blockchain using blockchainId
      const tx = await contract.updateStatus(product.blockchainId, statusNumber);
      const receipt = await tx.wait();

      // Update in backend using MongoDB _id
      const statusString = ['Created', 'InTransit', 'Delivered'][statusNumber];
      await productApi.updateStatus(product._id, statusString);
      
      const response = await productApi.getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
};
 ```
```

And in the render section, pass the entire product object:

```javascript
<Button
    variant="outline"
    size="sm"
    onClick={() => handleUpdateStatus(product)}
>
    Update Status
</Button>
 ```
```

These changes ensure that:

1. The blockchain ID is properly stored in the database
2. The entire product object is passed to the update handler
3. The correct blockchain ID is used for smart contract interactions
4. Transaction receipts are properly handled

## manishraj27
Copy

Delete

term_paper_project give a readme.md

## Trae AI
26 context(s) used

Here's a comprehensive README.md for your project:

term_paper_project/
├── frontend/           # React frontend
├── backend/           # Express backend
└── contracts/         # Solidity smart contracts

2. Install dependencies:
3. Create .env file:
```env
PORT=5000
DB_URL=mongodb://localhost:27017/term_paper_project_db_1
 ```
```

4. Start the server:
```bash
npm run dev
 ```

### Frontend Setup
1. Navigate to frontend directory:
```bash
cd frontend
 ```
2. Install dependencies:
```bash
npm install
 ```

3. Start the development server:
```bash
npm run dev
 ```


 ### Smart Contract Setup
1. Install Ganache and create a workspace
2. Deploy the contract using Remix or Truffle
3. Update the contract address in frontend/src/services/web3.js
## Usage
1. Connect MetaMask to your local Ganache network
2. Create new products using the form
3. Track product status changes
4. View transaction history
## API Endpoints
- POST /api/products - Create new product
- GET /api/products - Get all products
- PUT /api/products/:id/status - Update product status
- GET /api/products/:id/history - Get product history
- DELETE /api/products/:id - Delete product

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request