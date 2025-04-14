import { useState } from 'react';
import { 
  Home, 
  Package, 
  ScanLine, 
  BarChart3, 
  Settings,
  History,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// This would normally be integrated with React Router in a real app
const PAGES = {
  DASHBOARD: 'dashboard',
  PRODUCT_DETAIL: 'product-detail',
  SCAN: 'scan',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings'
};

export default function AppLayout({ children }) {
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const NavItems = () => (
    <>
      <div className="space-y-1">
        <Button 
          variant={currentPage === PAGES.DASHBOARD ? "secondary" : "ghost"} 
          className="w-full justify-start" 
          onClick={() => {
            setCurrentPage(PAGES.DASHBOARD);
            setIsMobileNavOpen(false);
          }}
        >
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button 
          variant={currentPage === PAGES.PRODUCT_DETAIL ? "secondary" : "ghost"} 
          className="w-full justify-start" 
          onClick={() => {
            setCurrentPage(PAGES.PRODUCT_DETAIL);
            setIsMobileNavOpen(false);
          }}
        >
          <Package className="mr-2 h-4 w-4" />
          Products
        </Button>
        <Button 
          variant={currentPage === PAGES.SCAN ? "secondary" : "ghost"} 
          className="w-full justify-start" 
          onClick={() => {
            setCurrentPage(PAGES.SCAN);
            setIsMobileNavOpen(false);
          }}
        >
          <ScanLine className="mr-2 h-4 w-4" />
          Scan QR
        </Button>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <Button 
          variant={currentPage === PAGES.ANALYTICS ? "secondary" : "ghost"} 
          className="w-full justify-start" 
          onClick={() => {
            setCurrentPage(PAGES.ANALYTICS);
            setIsMobileNavOpen(false);
          }}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </Button>
        <Button 
          variant={currentPage === PAGES.SETTINGS ? "secondary" : "ghost"} 
          className="w-full justify-start" 
          onClick={() => {
            setCurrentPage(PAGES.SETTINGS);
            setIsMobileNavOpen(false);
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </>
  );
  
  const renderCurrentPage = () => {
    switch(currentPage) {
      case PAGES.DASHBOARD:
        return <ProductDashboard />;
      case PAGES.PRODUCT_DETAIL:
        return <ProductDetailPage />;
      case PAGES.SCAN:
        return <QRScannerPage />;
      case PAGES.ANALYTICS:
        return <AnalyticsPlaceholder />;
      case PAGES.SETTINGS:
        return <SettingsPlaceholder />;
      default:
        return <ProductDashboard />;
    }
  };
  
  // Placeholder components for analytics and settings
  const AnalyticsPlaceholder = () => (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <MetricCard title="Total Products" value="45" icon={<Package />} />
        <MetricCard title="In Transit" value="12" icon={<Truck />} />
        <MetricCard title="Delivered" value="28" icon={<CheckCircle />} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-gray-500">Analytics visualizations would appear here</p>
        </CardContent>
      </Card>
    </div>
  );
  
  const MetricCard = ({ title, value, icon }) => (
    <Card>
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
  
  const SettingsPlaceholder = () => (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-500">Settings panel would appear here</p>
        </CardContent>
      </Card>
    </div>
  );
  
  // Import required components to make the layout work
  const Truck = () => <div className="h-6 w-6 text-amber-500" />;
  const CheckCircle = () => <div className="h-6 w-6 text-green-500" />;
  const Card = ({ children }) => <div className="bg-white rounded-lg border shadow-sm">{children}</div>;
  const CardHeader = ({ children }) => <div className="p-6 pb-0">{children}</div>;
  const CardContent = ({ className, children }) => <div className={className}>{children}</div>;
  const CardTitle = ({ children }) => <h3 className="text-lg font-medium">{children}</h3>;
  
  // Import our page components we created earlier
  const ProductDashboard = () => <ProductDashboard />;
  const ProductDetailPage = () => <ProductDetailPage />;
  const QRScannerPage = () => <QRScannerPage />;
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r px-3 py-4">
        <div className="mb-6 px-4 flex items-center">
          <History className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-xl font-bold">BlockTrack</h1>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <NavItems />
          </div>
          <div className="mt-auto pt-4 px-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">BC</span>
              </div>
              <div>
                <p className="text-sm font-medium">BlockChain Admin</p>
                <p className="text-xs text-muted-foreground">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden sticky top-0 bg-white border-b z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <History className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-xl font-bold">BlockTrack</h1>
            </div>
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 flex justify-between items-center border-b">
                    <div className="flex items-center">
                      <History className="h-6 w-6 text-primary mr-2" />
                      <h1 className="text-xl font-bold">BlockTrack</h1>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-4 flex-1">
                    <NavItems />
                  </div>
                  <div className="mt-auto p-4 border-t">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">BC</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">BlockChain Admin</p>
                        <p className="text-xs text-muted-foreground">admin@example.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1">
          {children || renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}