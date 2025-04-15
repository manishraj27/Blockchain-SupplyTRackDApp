import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreVertical, Check, Truck, Package } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { createProduct, updateProductStatus } from '../services/web3';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function ProductDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  
  // Setup form with react-hook-form
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      manufacturer: '',
    }
  });
  
  useEffect(() => {
    fetchProducts();
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
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Error loading products. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  const handleCreateProduct = async (values) => {
    if (!walletConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      setIsCreating(true);
      setTxStatus("Creating product on blockchain...");
      
      // Step 1: Create product on blockchain
      const blockchainResult = await createProduct({
        name: values.name,
        description: values.description
      });
      
      setTxStatus("Transaction confirmed on blockchain! Saving to database...");
      
      // Step 2: Save product in database with blockchain transaction details
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          manufacturer: values.manufacturer,
          // Use a placeholder value or omit blockchainId
          blockchainId: Math.floor(Math.random() * 10000), // Temporary mock ID
          blockchainTxHash: blockchainResult.txHash
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create product in database');
      }
      
      const savedProduct = await response.json();
      
      // Update the products list with the new product
      setProducts(prev => [savedProduct, ...prev]);
      
      // Reset form
      form.reset();
      
      setTxStatus("Product created successfully!");
      
      setTimeout(() => {
        setIsCreateDialogOpen(false);
        setTxStatus(null);
      }, 2000);
      
    } catch (err) {
      console.error("Create product error:", err);
      setError(`${err.message}`);
      setTxStatus(null);
    } finally {
      setIsCreating(false);
    }
  };
  const handleUpdateStatus = async (productId, newStatus) => {
    if (!walletConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      // First update on blockchain
      await updateProductStatus(productId, newStatus);
      
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
      
      // Update the local state
      setProducts(prev => 
        prev.map(product => 
          product._id === productId 
            ? { ...product, status: newStatus } 
            : product
        )
      );
      
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      console.error(err);
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
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500 mt-1">Manage and track your supply chain products</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          {!walletConnected && (
            <Button onClick={connectWallet} variant="outline">
              Connect Wallet
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to the blockchain-based supply chain system.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateProduct)} className="space-y-6">
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter product name" 
                              {...field} 
                              disabled={isCreating} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter product description" 
                              {...field} 
                              disabled={isCreating} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="manufacturer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manufacturer</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter manufacturer name" 
                              {...field} 
                              disabled={isCreating} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {txStatus && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription>{txStatus}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating || !walletConnected}>
                      {isCreating ? "Creating..." : "Create Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input 
            placeholder="Search products..." 
            prefix={<Search className="h-4 w-4 mr-2 text-gray-500" />}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="created">Registered</SelectItem>
              <SelectItem value="intransit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first product on the blockchain</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.productId ? product.productId.substring(0, 10) + '...' : 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.manufacturer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.blockchainData ? (
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm text-green-700">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-gray-300 mr-2"></div>
                          <span className="text-sm text-gray-500">Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          View
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              disabled={product.status === 'Created' || !walletConnected}
                              onClick={() => handleUpdateStatus(product._id, 'Created')}
                              className="cursor-pointer"
                            >
                              <Package className="mr-2 h-4 w-4" />
                              <span>Mark as Registered</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={product.status === 'InTransit' || !walletConnected}
                              onClick={() => handleUpdateStatus(product._id, 'InTransit')}
                              className="cursor-pointer"
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              <span>Mark as In Transit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={product.status === 'Delivered' || !walletConnected}
                              onClick={() => handleUpdateStatus(product._id, 'Delivered')}
                              className="cursor-pointer"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              <span>Mark as Delivered</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 px-6 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{products.length}</span> products
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}