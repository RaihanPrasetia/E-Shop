import { FC } from 'react';
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export const EmptyCartProduct: FC = () => (
    <Box className="text-center space-y-2 mt-4">
        <Typography color="text.secondary">
            Belum ada produk dalam keranjang ini.
        </Typography>
        <Link
            to="/products"
            className="inline-block px-4 py-2 bg-utama text-white rounded-md hover:bg-purple-700 transition"
        >
            Belanja Sekarang
        </Link>
    </Box>
);

export default EmptyCartProduct;