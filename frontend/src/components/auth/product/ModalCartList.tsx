import { FormattedCartType } from "@/utils/types/CartType";
import { Box, Button, Grid, Typography } from "@mui/material";


interface CartListProps {
    carts: FormattedCartType[];
    onSelectCart: (cartId: string) => void;
    openDrawer: () => void
}

export const ModalCartList = ({ carts, openDrawer, onSelectCart }: CartListProps) => {

    if (carts.length === 0) {
        return (
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                    Anda belum memiliki keranjang.
                </Typography>
                <Button variant="outlined" size="small" onClick={openDrawer}>
                    Buat Keranjang
                </Button>

            </Box>
        );
    }

    return (
        <>
            <Grid container spacing={2}>
                {carts.map((cart) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={cart.id}>
                        <Box
                            onClick={() => onSelectCart(cart.id)}
                            sx={{
                                cursor: "pointer",
                                p: 2,
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                "&:hover": { backgroundColor: "#f5f5f5" },
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold">
                                {cart.cart_name}
                            </Typography>
                            <Typography variant="body2">
                                {cart.products.length} produk
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>

        </>
    );
};
