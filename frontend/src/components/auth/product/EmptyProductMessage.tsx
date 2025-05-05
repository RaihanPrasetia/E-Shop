import { Box, Typography } from "@mui/material";

const EmptyProductMessage = () => (
    <Box className="w-full py-10 text-center">
        <Typography variant="h6" color="text.secondary">
            Tidak ada produk yang ditemukan.
        </Typography>
    </Box>
);

export default EmptyProductMessage;