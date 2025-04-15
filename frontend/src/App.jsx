import { Navigate, Route, Router, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProductDashboard from "./pages/ProductDashboard";
import ProductDetailPage from "./pages/ProductDetailPage";

// App component
export default function App() {
  return (

      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductDashboard />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
          <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
          <Route path="/history" element={<PlaceholderPage title="Transaction History" />} />
          <Route path="/users" element={<PlaceholderPage title="Users" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Routes>
      </Layout>

  );
}

// Placeholder component for routes that aren't implemented yet
function PlaceholderPage({ title }) {
  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-500">This page is under development.</p>
      </div>
    </div>
  );
}