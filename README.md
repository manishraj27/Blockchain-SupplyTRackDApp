# BlockTrack - Supply Chain Blockchain Project

A blockchain-based supply chain tracking application that allows users to register, track, and verify products throughout their journey across the supply chain. This application leverages Ethereum blockchain technology for data integrity and transparency.

## Project Structure

The project is divided into two main parts:

### Backend
- Node.js Express server
- MongoDB database integration
- Ethereum blockchain integration
- RESTful API for product management

### Frontend
- React application built with Vite
- Tailwind CSS and shadcn/ui components
- MetaMask wallet integration
- QR code scanning functionality

## Features

- **Product Registration**: Register new products on the blockchain
- **Status Updates**: Track products with status updates (Created, In Transit, Delivered)
- **Blockchain Verification**: Verify product authenticity through blockchain records
- **QR Code Scanning**: Scan product QR codes to quickly access product information
- **Comprehensive Dashboard**: View and manage all products in one place
- **Transaction History**: View complete product history with blockchain verification

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB
- Ethereum development environment (Ganache for local development)
- MetaMask browser extension

### Backend Setup

1. Navigate to the backend directory:
cd backend


2. Install dependencies:
npm install

3. Create a `.env` file based on `.env.example` with your configuration:

DB_URL=mongodb://localhost:27017/term_paper_project_db PORT=5000 BLOCKCHAIN_NETWORK=http://localhost:8545 WALLET_PRIVATE_KEY=your_private_key CONTRACT_ADDRESS=your_deployed_contract_address


4. Compile and deploy the smart contract:
npm run compile
npm run deploy

5. Start the development server:
npm run dev

### Frontend Setup

1. Navigate to the frontend directory:
cd frontend


2. Install dependencies:
npm install

3. Start the development server:
npm run dev

4. Open your browser and navigate to:
http://localhost:5173


## Smart Contract

The core smart contract (`SupplyChain.sol`) manages product registration and lifecycle on the Ethereum blockchain:

- Product registration
- Status updates
- Ownership tracking
- Product verification

## API Endpoints

- `POST /api/products` - Create a new product
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `GET /api/products/:id/history` - Get product history
- `PUT /api/products/:id/status` - Update product status
- `DELETE /api/products/:id` - Delete a product

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Web3.js
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Blockchain**: Ethereum, Solidity
- **Tools**: MetaMask, Ganache (for local blockchain)
