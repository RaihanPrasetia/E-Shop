import { formatToRupiah } from "@/utils/priceFormated";
import { FormattedProductType } from "@/utils/types/ProductType";
import { Box, Typography } from "@mui/material";

interface SelectedProductInfoProps {
    product: FormattedProductType;
    qty: number;
    onQtyChange: (value: number) => void;
}

const url = import.meta.env.VITE_API_URL

export const SelectedProductInfo = ({ product, qty, onQtyChange }: SelectedProductInfoProps) => (
    <Box mt={3} p={2} border="1px solid #ddd" borderRadius={2}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
            Produk yang Dipilih
        </Typography>

        <Box display="flex" alignItems="flex-start" gap={2}>
            <Box
                component="img"
                src={
                    product.images?.[0]?.file_path
                        ? `${url}/${product.images[0].file_path}`
                        : "/no-image.png"
                }
                alt={product.name}
                sx={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 2,
                    border: "1px solid #ccc",
                }}
            />
            <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                    {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {product.description}
                </Typography>
                <Typography variant="body1" mt={1} fontWeight="bold">
                    {formatToRupiah(product.price)}
                </Typography>
                <Box display="flex" justifyContent="end" alignItems="center" gap={1} mt={2}>
                    <Typography>Jumlah:</Typography>
                    <input
                        type="number"
                        value={qty}
                        min={1}
                        onChange={(e) => onQtyChange(parseInt(e.target.value))}
                        style={{
                            width: "80px",
                            padding: "6px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                        }}
                    />
                </Box>
            </Box>
        </Box>
    </Box>
);
