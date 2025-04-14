import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { updateProductStatus, getProductFromBlockchain } from '../services/web3';

// Mock API URL - replace with actual API URL in production
const API_URL = 'http://localhost:5000/api';

export default function ProductDetailPage() {
  // In a real app, you would get this from URL params using React Router
  const productId = "60f1a5b2e754e62b3c9d1234"; 
  
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [blockchainProduct, setBlockchainProduct] = useState(null);
  
  useEffect(() => {
    fetchProductDetails();
    checkWalletConnection();
  }, []);
  
  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setWalletConnected(accounts.length > 0);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          setWalletConnected(accounts.length > 0);
        });
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };
  
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        setError("Could not connect to MetaMask. Please make sure it's installed and unlocked.");
      }
    } else {
      setError("MetaMask is not installed. Please install it to use this application.");
    }
  };
  
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch from API
      const response = await fetch(`${API_URL}/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      const data = await response.json();
      setProduct(data);
      
      // Fetch history
      const historyResponse = await fetch(`${API_URL}/products/${productId}/history`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData);
      }
      
      // Try to fetch blockchain data if the product has a blockchain ID
      if (data.productId) {
        try {
          const onChainProduct = await getProductFromBlockchain(data.productId);
          setBlockchainProduct(onChainProduct);
        } catch (blockchainError) {
          console.error("Error fetching data from blockchain:", blockchainError);
          // Non-critical error, so we don't set the main error state
        }
      }
      
    } catch (err) {
      setError('Error loading product details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (newStatus) => {
    if (!walletConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      setUpdatingStatus(true);
      
      // First update on blockchain
      await updateProductStatus(product.productId, newStatus);
      
      // Then update in database
      const response = await fetch(`${API_URL}/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product status');
      }
      
      // Refresh product data
      fetchProductDetails();
      
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Created':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            <Package className="mr-1 h-3 w-3" /> Registered
          </Badge>
        );
      case 'InTransit':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            <Truck className="mr-1 h-3 w-3" /> In Transit
          </Badge>
        );
      case 'Delivered':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            <CheckCircle className="mr-1 h-3 w-3" /> Delivered
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const truncateHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Product not found</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button variant="outline" className="mr-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-500">Product ID: {product.productId ? truncateHash(product.productId) : 'Not on blockchain'}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!walletConnected ? (
            <Button onClick={connectWallet} variant="outline">
              Connect Wallet
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Update Status <MoreVertical className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  disabled={product.status === 'Created' || updatingStatus}
                  onClick={() => handleUpdateStatus('Created')}
                  className="cursor-pointer"
                >
                  <Package className="mr-2 h-4 w-4" />
                  <span>Mark as Registered</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled={product.status === 'InTransit' || updatingStatus}
                  onClick={() => handleUpdateStatus('InTransit')}
                  className="cursor-pointer"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  <span>Mark as In Transit</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled={product.status === 'Delivered' || updatingStatus}
                  onClick={() => handleUpdateStatus('Delivered')}
                  className="cursor-pointer"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Mark as Delivered</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button>Generate QR Code</Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="details">
            <TabsList className="p-0 bg-transparent border-b rounded-none">
              <TabsTrigger 
                value="details" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Product Details
              </TabsTrigger>
              <TabsTrigger 
                value="blockchain" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Blockchain Data
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-4">Basic Information</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">{getStatusBadge(product.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
                      <dd className="mt-1">{product.manufacturer}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1">{product.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="mt-1">{formatDate(product.createdAt)}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-4">Blockchain Verification</h3>
                  {product.blockchainData ? (
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1 flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-green-700">Verified on blockchain</span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Block Number</dt>
                        <dd className="mt-1">{product.blockchainData.blockNumber}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Transaction Hash</dt>
                        <dd className="mt-1">
                          <a 
                            href={`https://etherscan.io/tx/${product.blockchainData.txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-mono text-sm break-all"
                          >
                            {product.blockchainData.txHash}
                          </a>
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="bg-amber-50 p-4 rounded-md">
                      <p className="text-amber-800">This product is not verified on the blockchain yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="blockchain" className="py-6">
              <Card className="border shadow-none">
                <CardHeader className="bg-gray-50 px-6">
                  <CardTitle className="text-lg">On-Chain Data</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-4">
                  {!product.productId ? (
                    <div className="bg-amber-50 p-4 rounded-md">
                      <p className="text-amber-800">This product has not been registered on the blockchain.</p>
                    </div>
                  ) : blockchainProduct ? (
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                        <dd className="mt-1 font-mono text-sm break-all">{blockchainProduct.productId}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="mt-1">{blockchainProduct.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1">{blockchainProduct.description}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
                        <dd className="mt-1">{blockchainProduct.manufacturer}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">{getStatusBadge(blockchainProduct.status)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Owner Address</dt>
                        <dd className="mt-1 font-mono text-sm break-all">{blockchainProduct.owner}</dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="flex items-center justify-center p-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 px-6 py-4">
                  <div className="w-full text-sm text-gray-500">
                    <p>All product transitions are permanently recorded on the blockchain, ensuring data integrity and transparency throughout the supply chain.</p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="py-4">
              <div className="mb-4">
                <h3 className="font-medium text-lg">Product History</h3>
                <p className="text-sm text-gray-500">Complete record of this product's journey through the supply chain</p>
              </div>
              
              {history.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500">No history records available for this product</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    
                    {/* History items */}
                    {history.map((event, index) => (
                      <div key={index} className="relative pl-10 pb-8">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white bg-white shadow">
                          {event.status === 'Created' && <Package className="h-4 w-4 text-blue-500" />}
                          {event.status === 'InTransit' && <Truck className="h-4 w-4 text-amber-500" />}
                          {event.status === 'Delivered' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div>
                                <h4 className="font-semibold flex items-center">
                                  {getStatusBadge(event.status)}
                                </h4>
                                <p className="text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                              </div>
                              <div className="mt-2 md:mt-0">
                                <p className="text-xs font-mono text-gray-500">
                                  Transaction: {truncateHash(event.transactionHash)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}