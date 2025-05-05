import { Card, CardMedia, CardContent, Box, Typography, Chip, Button } from "@mui/material";
import { AddShoppingCart } from "@mui/icons-material";
import { FormattedProductType } from "@/utils/types/ProductType";
import { formatToRupiah } from "@/utils/priceFormated";

const url = import.meta.env.VITE_API_URL;

interface ProductCardProps {
    product: FormattedProductType;
    onAddToCart: (productId: string) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => (
    <Card
        sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "transparent",
            boxShadow: "none",
            border: "none",
            borderRadius: "10px",
            transition: "bgcolor 0.3s ease",
            "&:hover": {
                bgcolor: "#ffffff",
            },
        }}
    >
        <CardMedia
            component="img"
            image={
                product.images?.[0]?.file_path
                    ? `${url}/${product.images[0].file_path}`
                    : "/no-image.png"
            }
            alt={product.name}
            sx={{
                height: 240,
                objectFit: "contain",
                borderRadius: "10px 10px 0 0",
            }}
        />
        <CardContent>
            <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
                <Box>
                    <Typography gutterBottom variant="h6" component="div">
                        {product.name}
                    </Typography>
                    <Typography className="h-[40px]" variant="body2" color="text.secondary">
                        {product.description}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold" mt={1}>
                        {formatToRupiah(product.price)}
                    </Typography>
                    <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                        <Chip label={product.category?.name ?? "Tanpa Kategori"} size="small" />
                    </Box>
                </Box>
                <Button
                    className="bg-utama"
                    variant="contained"
                    onClick={() => onAddToCart(product.id)}
                    sx={{ alignSelf: "flex-end", marginTop: 2 }}
                    startIcon={<AddShoppingCart />}
                >
                    Add to Cart
                </Button>
            </Box>
        </CardContent>
    </Card>
);

export default ProductCard;