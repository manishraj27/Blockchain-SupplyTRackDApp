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
// FIX: Only pass name and description to match the contract function signature
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
    
    // Get the latest product count
    // This works because the contract increments the count when creating a product
    const productId = await contract.productCount();
    console.log('Current product count:', productId.toString());
    
    return { 
      success: true, 
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      productId: productId.toString()
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
export const getProductFromBlockchain = async (productId) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error('Contract connection failed');
    
    const productData = await contract.getProduct(productId);
    
    // Convert numeric status to string
    const statusMap = ['Created', 'InTransit', 'Delivered'];
    
    return {
      id: productData[0],
      name: productData[1],
      description: productData[2],
      manufacturer: productData[3],
      status: statusMap[parseInt(productData[4])],
      timestamp: parseInt(productData[5])
    };
  } catch (error) {
    console.error('Error fetching product from blockchain:', error);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};