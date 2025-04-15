import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Package, 
  BarChart3, 
  Settings, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Home,
  Boxes, 
  LayoutDashboard,
  History
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';


// Layout component that includes the sidebar
function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-white shadow-md"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 bg-white border-r",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* App logo and name */}
          <div className="flex items-center h-16 px-6 border-b">
            <Boxes className="h-6 w-6 text-primary mr-2" />
            <span className="text-lg font-semibold">SupplyChain DApp</span>
          </div>
          
          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-4 space-y-1">
              <p className="text-xs font-semibold text-gray-500 px-2 mb-2 uppercase tracking-wider">
                General
              </p>
              <NavItem to="/" icon={<Home />} label="Home" isActive={location.pathname === '/'} />
              <NavItem to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" isActive={location.pathname === '/dashboard'} />
              <NavItem to="/products" icon={<Package />} label="Products" isActive={location.pathname === '/products' || location.pathname.startsWith('/products/')} />
              
              <p className="text-xs font-semibold text-gray-500 px-2 mt-6 mb-2 uppercase tracking-wider">
                Analytics
              </p>
              <NavItem to="/analytics" icon={<BarChart3 />} label="Analytics" isActive={location.pathname === '/analytics'} />
              <NavItem to="/history" icon={<History />} label="Transaction History" isActive={location.pathname === '/history'} />
              
              <p className="text-xs font-semibold text-gray-500 px-2 mt-6 mb-2 uppercase tracking-wider">
                Management
              </p>
              <NavItem to="/users" icon={<Users />} label="Users" isActive={location.pathname === '/users'} />
              <NavItem to="/settings" icon={<Settings />} label="Settings" isActive={location.pathname === '/settings'} />
            </nav>
          </ScrollArea>
          
          {/* User profile & logout */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                JD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <Separator className="my-4" />
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out bg-white",
          sidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        {/* Top header */}
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-semibold">
            {location.pathname === '/products' && 'Products Dashboard'}
            {location.pathname.includes('/products/') && 'Product Details'}
            {location.pathname === '/' && 'Home'}
            {location.pathname === '/dashboard' && 'Dashboard Overview'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Need Help?
            </Button>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-0">
          {children}
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}


export default Layout;

// Navigation item component
function NavItem({ to, icon, label, isActive }) {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start mb-1",
          isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-gray-600 hover:text-gray-900"
        )}
      >
        {React.cloneElement(icon, { className: "h-4 w-4 mr-3" })}
        {label}
      </Button>
    </Link>
  );
}
