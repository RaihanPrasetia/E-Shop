import { useState } from 'react';
import { Box, Button, Typography } from "@mui/material";
import { CartDrawer } from './CartDrawer';
import { FormattedCartType } from '@/utils/types/CartType';

interface EmptyCart {
    onSuccess: () => void;
}


const EmptyCart = ({ onSuccess }: EmptyCart) => {
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [selectedCart, setSelectedacart] = useState<FormattedCartType | null>(null);

    const handleOpenDrawer = (mode: "add" | "edit", cart?: FormattedCartType) => {
        if (mode === "edit" && cart) {
            setSelectedacart(cart);
            setEditMode(true);
        } else {
            setSelectedacart(null);
            setEditMode(false);
        }
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedacart(null);
    };

    return (
        <Box className="text-center space-y-2 mt-4">
            <Typography color="text.secondary">
                Belum Ada Keranjang.
            </Typography>
            <Button
                className="inline-block px-4 py-2 bg-utama text-white rounded-md hover:bg-purple-700 transition"
                onClick={() => handleOpenDrawer("add")}
            >
                <span className='text-white'>Buat daftar keranjang.</span>
            </Button>

            <CartDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                editMode={editMode}
                cart={selectedCart}
                onSuccess={() => {
                    handleCloseDrawer();
                    onSuccess()
                }}
            />
        </Box>


    );
};

export default EmptyCart;
