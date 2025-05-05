// OrderSummary.tsx
import { FC } from "react";
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
} from "@mui/material";
import { FormattedCartType } from "@/utils/types/CartType";
import { formatToRupiah } from "@/utils/priceFormated";

interface OrderSummaryProps {
    cart: FormattedCartType;
    qtyMap: Record<string, number>;
}

export const OrderSummary: FC<OrderSummaryProps> = ({ cart, qtyMap }) => {
    return (
        <List>
            {cart.products.map((item) => {
                const qty = qtyMap[item.cart_item_id] ?? item.qty ?? 1;
                return (
                    <ListItem key={item.cart_item_id} disableGutters alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar
                                variant="rounded"
                                src={`${import.meta.env.VITE_API_URL}/${item.image_path}`}
                                alt={item.name}
                                sx={{ width: 56, height: 56, mr: 2 }}
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary={`${item.name} × ${qty}`}
                            secondary={formatToRupiah(parseFloat(item.price) * qty)}
                        />
                    </ListItem>
                );
            })}
        </List>
    );
};

export default OrderSummary;