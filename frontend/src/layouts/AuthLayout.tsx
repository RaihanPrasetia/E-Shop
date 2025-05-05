import FooterGuest from '@/components/guest/FooterGuest';
import { Outlet } from 'react-router-dom';
import NavbarAuth from '@/components/auth/NavbarAuth';
import { useCallback, useEffect, useState } from 'react';
import { useNotification } from '@/hooks/useNotification';
import userDashboardService from '@/services/dashboard/userDashboard';
import { Box } from '@mui/material';
import { FaSpinner } from 'react-icons/fa';
import { FormattedOrderType } from '@/utils/types/OrderType';

export default function AuthLayout() {
    const [orders, setOrders] = useState<FormattedOrderType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [cartCount, setCartCount] = useState<number>(0);
    const [orderCount, setOrderCount] = useState<number>(0);

    const { showNotification } = useNotification();

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const response = await userDashboardService.getDashboards();
            setOrders(response.orderedProducts);
            setCartCount(response.cartCount);
            setOrderCount(response.orderCount);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Gagal mengambil produk";
            showNotification(message, "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    if (loading) {
        return (
            <Box className="w-full min-h-[100vh] flex flex-col justify-center items-center gap-4">
                <FaSpinner className="animate-spin text-purple-600 text-3xl" />
                <p className="text-utama text-lg">Loading...</p>
            </Box>
        );
    }

    return (
        <div className="min-h-screen flex flex-col m-0 p-0 bg-gray-100 text-black">
            <NavbarAuth cartCount={cartCount} />
            <div className='min-h-[80vh]'>
                <Outlet context={{ cartCount, orders, orderCount }} />
            </div>
            <FooterGuest />
        </div>
    );
}
