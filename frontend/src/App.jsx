import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productApi } from "./services/api";
import { getContract } from "./services/web3";

function App() {
  const [products, setProducts] = useState([]);
  const [contract, setContract] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(true);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      try {
        const supplyChainContract = await getContract();
        if (!supplyChainContract) {
          setIsMetaMaskInstalled(false);
          return;
        }
        setContract(supplyChainContract);
      } catch (error) {
        console.error("Failed to initialize contract:", error);
        setIsMetaMaskInstalled(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await productApi.getProducts();
        setProducts(response.data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      }
    };

    initContract();
    fetchProducts();
  }, []);

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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Supply Chain Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  className="w-full p-2 border rounded"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <textarea
                  placeholder="Description"
                  className="w-full p-2 border rounded"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Add New Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product._id} className="p-4 border rounded">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-sm ${
                        product.status === 'Created' ? 'bg-blue-100 text-blue-800' :
                        product.status === 'InTransit' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {product.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(product)}
                      >
                        Update Status
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(product.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;