import { useNotification } from "@/hooks/useNotification";
import productService from "@/services/product/productService";
import { FormattedProductType } from "@/utils/types/ProductType";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";

export default function ProductSection() {
    const [products, setProduct] = useState<FormattedProductType[] | []>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [is_featured] = useState(true)
    const { showNotification } = useNotification();

    const fetchGuest = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productService.getProducts({ is_featured });
            setProduct(response.productsFormatted);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Gagal mengambil produk";
            showNotification(message, "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGuest();
    }, [fetchGuest]);

    if (loading) {
        return (
            <Box className="w-full min-h-[100vh] flex flex-col justify-center items-center gap-4">
                <FaSpinner className="animate-spin text-purple-600 text-3xl" />
                <p className="text-utama text-lg">Loading...</p>
            </Box>
        );
    }
    return (
        <Container sx={{ my: 10 }}>
            <Typography
                variant="h4"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
                sx={{ mb: 5 }}
            >
                Produk Unggulan
            </Typography>

            <Grid container spacing={4} mt={2} columns={{ xs: 3, md: 12 }}>
                {products.map((product) => (
                    <Grid size={{ xs: 3 }} key={product.id}>
                        <Box
                            sx={{
                                border: "1px solid #eee",
                                borderRadius: 2,
                                overflow: "hidden",
                                textAlign: "center",
                                p: 2,
                            }}
                        >
                            <Box
                                component="img"
                                src={`${import.meta.env.VITE_API_URL}/${product.images?.[0]?.file_path}` || "/placeholder.jpg"}
                                alt={product.name}
                                sx={{
                                    width: "100%",
                                    height: 200,
                                    objectFit: "cover",
                                    mb: 2,
                                }}
                            />
                            <Typography fontWeight="bold">{product.name}</Typography>
                            <Typography color="text.secondary" mb={1}>
                                Rp {Number(product.price).toLocaleString("id-ID")}
                            </Typography>
                            <Button variant="outlined" size="small">
                                Lihat Detail
                            </Button>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
