import { useState, useEffect } from 'react';
import { QrScanner } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// Mock function - in a real app you would use a QR scanner library
// such as react-qr-scanner or html5-qrcode
const mockScanQRCode = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // This would be the scanned product ID in a real app
      resolve("60f1a5b2e754e62b3c9d1234");
    }, 1500);
  });
};

const API_URL = 'http://localhost:5000/api';

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  
  const startScanning = async () => {
    try {
      setScanning(true);
      setError(null);
      
      // In a real app, this would activate the device camera
      const scannedId = await mockScanQRCode();
      setProductId(scannedId);
      setScanSuccess(true);
      
      // Automatically search for the product after successful scan
      fetchProduct(scannedId);
    } catch (err) {
      setError("Error accessing camera or scanning QR code. Please try again.");
      console.error(err);
    } finally {
      setScanning(false);
    }
  };
  
  const fetchProduct = async (id) => {
    try {
      setLoading(true);
      setError(null);
      setProduct(null);
      
      const response = await fetch(`${API_URL}/products/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Product not found. Please check the ID and try again.");
        }
        throw new Error("Failed to fetch product details");
      }
      
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err.message || "Error fetching product details. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleManualSearch = (e) => {
    e.preventDefault();
    if (productId.trim()) {
      fetchProduct(productId);
    }
  };
  
  const resetSearch = () => {
    setProduct(null);
    setProductId('');
    setScanSuccess(false);
    setError(null);
  };
  
  return (
    <div className="container mx-auto py-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Scan Product QR Code</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Product Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scan">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scan" className="py-6">
              <div className="flex flex-col items-center justify-center">
                {scanning ? (
                  <div className="w-full max-w-sm aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="flex flex-col items-center">
                      <div className="animate-pulse">
                        <QrScanner className="h-16 w-16 text-primary" />
                      </div>
                      <p className="mt-4 text-gray-500">Scanning...</p>
                    </div>
                  </div>
                ) : scanSuccess ? (
                  <div className="w-full max-w-sm mb-4">
                    <div className="bg-green-50 rounded-lg p-4 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-green-700 font-medium">QR Code Scanned Successfully!</p>
                        <p className="text-sm text-green-600 mt-1">Product ID: {productId}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-sm aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center p-4">
                      <QrScanner className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Position the QR code within the scanner area</p>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={scanning || loading ? undefined : startScanning} 
                  disabled={scanning || loading}
                  className="w-full max-w-sm"
                >
                  {scanning ? "Scanning..." : "Start Scanning"}
                </Button>
                
                {scanSuccess && (
                  <Button 
                    variant="outline" 
                    onClick={resetSearch} 
                    className="w-full max-w-sm mt-2"
                  >
                    Scan New Code
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="py-6">
              <form onSubmit={handleManualSearch}>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="productId" className="text-sm font-medium">
                      Product ID
                    </label>
                    <Input
                      id="productId"
                      placeholder="Enter product ID"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading || !productId.trim()}>
                    {loading ? "Searching..." : "Search Product"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-500">Loading product details...</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {product && (
        <Card>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="font-medium">
                  {product.status === 'Created' && "✅ Product Registered"}
                  {product.status === 'InTransit' && "🚚 In Transit"}
                  {product.status === 'Delivered' && "📦 Delivered"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p>{product.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Manufacturer</h3>
                <p>{product.manufacturer}</p>
              </div>
              
              <div className="pt-2">
                <h3 className="text-sm font-medium text-gray-500">Blockchain Verification</h3>
                <div className="flex items-center mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-green-700">Verified on blockchain</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = `/products/${product._id}`}>
              View Complete Details
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}