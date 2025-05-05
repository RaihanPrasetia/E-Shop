import { FC, useEffect, useState } from 'react';
import { Box, Card, CardContent, CardMedia, IconButton, TextField, Typography } from "@mui/material";
import { MdDelete } from "react-icons/md";
import { formatToRupiah } from "@/utils/priceFormated";
import { CartProductType } from '@/utils/types/CartType';

const API_URL = import.meta.env.VITE_API_URL;

interface CartProductItemProps {
    product: CartProductType;
    qtyMap: Record<string, number>;
    onQtyChange: (cartItemId: string, newQty: number) => void;
    onDelete: (cartItemId: string) => void;
}

export const CartProductItem: FC<CartProductItemProps> = ({
    product,
    qtyMap,
    onQtyChange,
    onDelete,
}) => {
    // Get quantity from qtyMap, default to product's qty or 1 if neither exists
    const currentQty = qtyMap[product.cart_item_id] ?? product.qty ?? 1;
    const [inputValue, setInputValue] = useState<string>(currentQty.toString());

    // Update local state whenever qtyMap changes
    useEffect(() => {
        const qty = qtyMap[product.cart_item_id];
        if (qty !== undefined) {
            setInputValue(qty.toString());
        }
    }, [qtyMap, product.cart_item_id, currentQty]);


    // Handle direct input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only update the local input value, not the actual quantity yet
        setInputValue(e.target.value);
    };

    // Handle input blur (when user finishes editing)
    const handleInputBlur = () => {
        let parsed = parseInt(inputValue, 10);

        // Validate input
        if (isNaN(parsed) || parsed < 1) {
            parsed = 1;
        }

        // Update the quantity in parent component
        onQtyChange(product.cart_item_id, parsed);

        // Ensure the input value reflects the actual quantity (for cases where validation changed it)
        setInputValue(parsed.toString());
    };

    // Handle keydown event for input field
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Submit on Enter key
        if (e.key === 'Enter') {
            e.currentTarget.blur(); // Trigger blur event which will update quantity
        }
    };

    return (
        <Card
            variant="outlined"
            sx={{
                backgroundColor: "transparent",
                transition: "0.3s",
                borderColor: "rgba(0, 0, 0, 0)",
                '&:hover': {
                    backgroundColor: "rgba(241, 223, 253, 0.519)",
                },
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <Box className="flex items-center gap-4">
                <CardMedia
                    component="img"
                    sx={{ width: 100, height: 100, borderRadius: 2, objectFit: "cover", backgroundColor: "white" }}
                    image={product.image_path ? `${API_URL}/${product.image_path}` : "/no-image.png"}
                    alt={product.name}
                />
                <CardContent>
                    <Typography fontWeight="bold">{product.name}</Typography>
                    <Typography color="text.secondary">
                        Harga: {formatToRupiah(parseFloat(product.price))}
                    </Typography>
                    <Typography color="text.secondary">
                        Total: {formatToRupiah(parseFloat(product.price) * currentQty)}
                    </Typography>
                </CardContent>
            </Box>

            <Box className="flex items-center gap-2 pr-4">

                <TextField
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    size="small"
                    sx={{ width: 60 }}
                    inputProps={{
                        min: 1,
                        style: { textAlign: 'start' }
                    }}
                />

                <IconButton
                    color="error"
                    onClick={() => onDelete(product.cart_item_id)}
                >
                    <MdDelete />
                </IconButton>
            </Box>
        </Card>
    );
};

export default CartProductItem;