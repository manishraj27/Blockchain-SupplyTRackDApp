import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductDashboard from './pages/ProductDashboard';
import AppLayout from './components/AppLayout';

import ProductDetailPage from './pages/ProductDetailPage';


export default function App() {
  return (
    <AppLayout>
      <ProductDashboard />
      <Routes>

        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </AppLayout>


  );
}

