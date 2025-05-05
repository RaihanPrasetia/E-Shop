import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GuestLayout from '@/layouts/GuestLayout';
import Home from '@/pages/guest/Home';
import Login from '@/pages/guest/Login';
import AuthLayout from '@/layouts/AuthLayout';
import Dashboard from '@/pages/auth/Dashboard';
import NotFound from '@/layouts/NotFound';
import AdminLayout from '@/layouts/AdminLayout';
import LoginAdmin from '@/pages/admin/LoginAdmin';
import DashboardAdmin from '@/pages/admin/DashboardAdmin';
import CategoryPage from '@/pages/admin/category/CategoryPage';
import ProductPage from '@/pages/admin/products/ProductPage';
import StorePage from '@/pages/admin/store/StorePage';
import AuditPage from '@/pages/admin/history/AuditPage';
import CustomerPage from '@/pages/admin/customer/CustomerPage';
import ProductAuth from '@/pages/auth/ProductAuth';
import ProductDetail from '@/pages/admin/products/ProductDetail';
import CartAuth from '@/pages/auth/CartAuth';
import PaymentPage from '@/pages/admin/history/payment/PaymentPage';
import { PaymentDetail } from '@/pages/admin/history/payment/PaymentDetail';
import ProtectedRoute from './ProtectedRoute';


export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Guest Routes */}
                <Route element={<GuestLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin/login" element={<LoginAdmin />} />
                </Route>

                {/* Authenticated User Routes */}
                <Route element={
                    <ProtectedRoute>
                        <AuthLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<ProductAuth />} />
                    <Route path="/carts" element={<CartAuth />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute>
                    <AdminLayout />
                </ProtectedRoute>}>

                    <Route path="dashboard" element={<DashboardAdmin />} />
                    <Route path="product" element={<ProductPage />} />
                    <Route path="category" element={<CategoryPage />} />
                    <Route path="store" element={<StorePage />} />
                    <Route path="history/audit" element={<AuditPage />} />
                    <Route path="history/payment" element={<PaymentPage />} />
                    <Route path="history/payment/detail" element={<PaymentDetail />} />
                    <Route path="user" element={<CustomerPage />} />
                    <Route path="product/detail" element={<ProductDetail />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
