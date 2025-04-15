import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Truck, 
  Package, 
  Check, 
  ExternalLink, 
  Clock,
  AlertCircle,
  Share2,
  Download,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { updateProductStatus } from '../services/web3';

const API_URL = 'http://localhost:5000/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    checkWalletConnection();
  }, [id]);

  useEffect(() => {
    // Reset success message after 3 seconds
    if (statusUpdateSuccess) {
      const timer = setTimeout(() => {
        setStatusUpdateSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusUpdateSuccess]);

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
      const response = await fetch(`${API_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      const data = await response.json();
      setProduct(data);
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
      setStatusUpdateLoading(true);
      setError(null);
      
      if (!product.productId) {
        throw new Error('Product does not have a blockchain ID');
      }
      
      // First update on blockchain
      await updateProductStatus(product, newStatus);
      
      // Then update in database
      const response = await fetch(`${API_URL}/products/${product._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product status');
      }
      
      // Update the local state
      setProduct(prev => ({
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString()
      }));

      setStatusUpdateSuccess(true);
      
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      console.error(err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Created':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Registered</Badge>;
      case 'InTransit':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">In Transit</Badge>;
      case 'Delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Delivered</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Created':
        return <Package className="h-6 w-6 text-blue-600" />;
      case 'InTransit':
        return <Truck className="h-6 w-6 text-amber-600" />;
      case 'Delivered':
        return <Check className="h-6 w-6 text-green-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-400" />;
    }
  };

  const renderTimeline = () => {
    const statusOrder = ['Created', 'InTransit', 'Delivered'];
    const currentStatusIndex = statusOrder.indexOf(product.status);
    
    return (
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {statusOrder.map((status, index) => {
          const isPast = index <= currentStatusIndex;
          const iconColor = isPast ? 'text-white' : 'text-gray-400';
          const bgColor = isPast ? 'bg-primary' : 'bg-gray-200';
          
          return (
            <div key={status} className="relative pl-10 pb-8 last:pb-0">
              <div className={`absolute left-0 rounded-full w-8 h-8 flex items-center justify-center ${bgColor}`}>
                {status === 'Created' && <Package className={`h-4 w-4 ${iconColor}`} />}
                {status === 'InTransit' && <Truck className={`h-4 w-4 ${iconColor}`} />}
                {status === 'Delivered' && <Check className={`h-4 w-4 ${iconColor}`} />}
              </div>
              <div className="flex flex-col">
                <h4 className="font-medium text-gray-900">
                  {status === 'Created' ? 'Registered' : 
                   status === 'InTransit' ? 'In Transit' : 'Delivered'}
                </h4>
                <p className="text-sm text-gray-500">
                  {isPast ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Product not found</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center space-x-3 mt-1">
            <div className="text-gray-500">ID: {product._id}</div>
            {getStatusBadge(product.status)}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!walletConnected ? (
            <Button onClick={connectWallet} variant="outline" className="whitespace-nowrap">
              Connect Wallet
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={statusUpdateLoading}>
                  Update Status {statusUpdateLoading && <span className="ml-2 animate-spin">◌</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  disabled={product.status === 'Created' || statusUpdateLoading}
                  onClick={() => handleUpdateStatus('Created')}
                  className="cursor-pointer"
                >
                  <Package className="mr-2 h-4 w-4" />
                  <span>Mark as Registered</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled={product.status === 'InTransit' || statusUpdateLoading}
                  onClick={() => handleUpdateStatus('InTransit')}
                  className="cursor-pointer"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  <span>Mark as In Transit</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled={product.status === 'Delivered' || statusUpdateLoading}
                  onClick={() => handleUpdateStatus('Delivered')}
                  className="cursor-pointer"
                >
                  <Check className="mr-2 h-4 w-4" />
                  <span>Mark as Delivered</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                <span>Copy Product ID</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                <span>Export Details</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {statusUpdateSuccess && (
        <Alert className="mb-6 bg-green-50 border border-green-200 text-green-700">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Product status has been updated successfully!</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">Status History</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dl className="divide-y divide-gray-100">
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Name</dt>
                          <dd className="text-sm text-gray-900">{product.name}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="text-sm text-gray-900">{product.description}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
                          <dd className="text-sm text-gray-900">{product.manufacturer}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm text-gray-900">{getStatusBadge(product.status)}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <dl className="divide-y divide-gray-100">
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                          <dd className="text-sm text-gray-900">{product.productId || 'N/A'}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Created At</dt>
                          <dd className="text-sm text-gray-900">{new Date(product.createdAt).toLocaleString()}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                          <dd className="text-sm text-gray-900">{new Date(product.updatedAt).toLocaleString()}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Status Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderTimeline()}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="blockchain">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Blockchain Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    {product.productId ? (
                      <Alert className="bg-green-50 border-green-200">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertTitle>Verified on Blockchain</AlertTitle>
                        <AlertDescription>
                          This product has been verified and recorded on the blockchain.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle>Not Verified</AlertTitle>
                        <AlertDescription>
                          This product has not been verified on the blockchain yet.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Blockchain Details</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <dl className="divide-y divide-gray-200">
                          <div className="py-3 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                            <dd className="text-sm text-gray-900 font-mono">{product.productId || 'N/A'}</dd>
                          </div>
                          <div className="py-3 flex justify-between items-center">
                            <dt className="text-sm font-medium text-gray-500">Transaction Hash</dt>
                            <dd className="text-sm text-gray-900 font-mono flex items-center">
                              {product.blockchainTxHash ? (
                                <>
                                  <span className="truncate max-w-xs">{product.blockchainTxHash}</span>
                                  <a 
                                    href={`https://sepolia.etherscan.io/tx/${product.blockchainTxHash}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </>
                              ) : 'N/A'}
                            </dd>
                          </div>
                          <div className="py-3 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Blockchain Network</dt>
                            <dd className="text-sm text-gray-900">Ethereum (Sepolia Testnet)</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Blockchain Actions</h3>
                      <div className="space-y-2">
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          disabled={!product.blockchainTxHash}
                          onClick={() => window.open(`https://sepolia.etherscan.io/tx/${product.blockchainTxHash}`, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on Etherscan
                        </Button>
                        
                        <Button className="w-full justify-start" variant="outline">
                          <Clock className="mr-2 h-4 w-4" />
                          View Transaction History
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-80">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                {getStatusIcon(product.status)}
                <div>
                  <h3 className="font-medium">
                    {product.status === 'Created' ? 'Registered' : 
                     product.status === 'InTransit' ? 'In Transit' : 
                     product.status === 'Delivered' ? 'Delivered' : 'Unknown'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(product.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Status Actions</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      disabled={product.status === 'Created' || statusUpdateLoading || !walletConnected}
                      onClick={() => handleUpdateStatus('Created')}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Mark as Registered
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      disabled={product.status === 'InTransit' || statusUpdateLoading || !walletConnected}
                      onClick={() => handleUpdateStatus('InTransit')}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Mark as In Transit
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      disabled={product.status === 'Delivered' || statusUpdateLoading || !walletConnected}
                      onClick={() => handleUpdateStatus('Delivered')}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Delivered
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Blockchain Verification</CardTitle>
            </CardHeader>
            <CardContent>
              {product.productId ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center mb-4">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-green-700">Verified on Blockchain</span>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center mb-4">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm text-yellow-700">Not Verified</span>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={!product.productId}
                    onClick={() => window.open(`https://sepolia.etherscan.io/tx/${product.blockchainTxHash}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Etherscan
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="mr-2 h-4 w-4" />
                    View Transaction History
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Product Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}