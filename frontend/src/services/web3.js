import { ethers } from 'ethers';
import SupplyChainABI from '../contracts/SupplyChain.json';

const CONTRACT_ADDRESS = '0x69cCd8f309752975fE801e9EaCC2cB3b21659CB2';

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
    
    console.log('Creating product with:', productData.name, productData.description);
    
    // Call the contract function
    const tx = await contract.createProduct(
      productData.name,
      productData.description
    );
    
    console.log('Transaction submitted:', tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction mined:', receipt);
    
    // Just return transaction details without product ID
    return { 
      success: true, 
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error creating product on blockchain:', error);
    throw new Error(`Blockchain transaction failed: ${error.message}`);
  }
};
// Helper function to update product status via the smart contract
export const updateProductStatus = async (productId, newStatus) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error('Contract connection failed');
    
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
// Helper function to get product details from the smart contract using tx hash
export const getProductFromBlockchain = async (blockchainTxHash) => {
  try {
    const contract = await getContract();
    if (!contract) {
      throw new Error('Failed to initialize contract');
    }
    
    // If your contract doesn't have a way to look up by tx hash,
    // you might need to store the product ID in your MongoDB document
    // For now we'll assume we're using the numeric ID from the contract
    
    // Extract the product ID from your database or parse from transaction receipt
    const numericId = parseInt(blockchainTxHash, 16) % 1000000; // Just an example - replace with your logic
    
    const product = await contract.getProduct(numericId);
    
    return {
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      manufacturer: product.manufacturer,
      status: ['Created', 'InTransit', 'Delivered'][product.status],
      timestamp: new Date(Number(product.timestamp) * 1000).toISOString(),
      exists: product.exists
    };
  } catch (error) {
    console.error('Error fetching product from blockchain:', error);
    throw new Error(`Blockchain error: ${error.message}`);
  }
};