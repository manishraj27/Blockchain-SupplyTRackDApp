import { ethers } from 'ethers';
import SupplyChainABI from '../contracts/SupplyChain.json';

const CONTRACT_ADDRESS = '0x2E218bEb8216D790A6B73618Da6193b53D99e83F';

export const getWeb3Provider = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Please install MetaMask to use this application');
  }
  
  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return new ethers.BrowserProvider(window.ethereum);
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw new Error('Failed to connect to MetaMask');
  }
};

export const getContract = async () => {
  const provider = await getWeb3Provider();
  if (!provider) return null;
  
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, SupplyChainABI.abi, signer);
};

// Helper function to create a product via the smart contract
export const createProduct = async (productData) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error('Contract connection failed');
    
    // Generate a unique product ID - using MongoDB ObjectId format
    // This will be stored in both blockchain and database to link them
    const productId = generateUniqueId();
    
    console.log('Creating product with ID:', productId);
    
    // Call the contract function with only the productId parameter
    const tx = await contract.createProduct(productId);
    
    console.log('Transaction submitted:', tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction mined:', receipt);
    
    // Return transaction details and the product ID
    return { 
      success: true, 
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      productId: productId // Include the generated ID
    };
  } catch (error) {
    console.error('Error creating product on blockchain:', error);
    throw new Error(`Blockchain transaction failed: ${error.message}`);
  }
};

// Helper function to update product status via the smart contract
export const updateProductStatus = async (product, newStatus) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error('Contract connection failed');
    
    // We need the blockchain product ID, not the MongoDB _id
    const productId = product.productId;
    if (!productId) {
      throw new Error('Product does not have a blockchain ID');
    }
    
    // Convert status string to number used in the contract
    const statusMap = {
      'Created': 0,
      'InTransit': 1,
      'Delivered': 2
    };
    
    const statusCode = statusMap[newStatus];
    if (statusCode === undefined) throw new Error('Invalid status');
    
    const tx = await contract.updateProductStatus(productId, statusCode);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    return { 
      success: true, 
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error updating product status on blockchain:', error);
    throw new Error(`Blockchain transaction failed: ${error.message}`);
  }
};

// Helper function to get product details from the smart contract
export const getProductFromBlockchain = async (productId) => {
  try {
    const contract = await getContract();
    if (!contract) {
      throw new Error('Failed to initialize contract');
    }
    
    // Add error handling and default values
    try {
      const product = await contract.getProduct(productId);
      
      return {
        productId: productId,
        status: ['Created', 'InTransit', 'Delivered'][product[0]] || 'Unknown',
        timestamp: new Date(Number(product[1] || 0) * 1000).toISOString(),
        exists: product[2] || false
      };
    } catch (error) {
      console.error(`Error fetching product ${productId} from blockchain:`, error);
      // Return a default object instead of throwing
      return {
        productId: productId,
        status: 'Unknown',
        timestamp: new Date().toISOString(),
        exists: false,
        error: error.message
      };
    }
  } catch (error) {
    console.error('Error connecting to blockchain:', error);
    throw new Error(`Blockchain connection error: ${error.message}`);
  }
};

// Generate a unique ID similar to MongoDB ObjectId format
function generateUniqueId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomPart = Math.random().toString(16).substring(2, 14).padStart(12, '0');
  const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  return timestamp + randomPart + counter;
}