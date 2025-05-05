import { FC, useState } from 'react';
import {
    Box,
    Card,
    CardActionArea,
    IconButton,
    Menu,
    MenuItem,
    Typography
} from '@mui/material';
import { MdShoppingCart } from 'react-icons/md';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import formattedDate from '@/utils/formattedDate';
import { FormattedCartType } from '@/utils/types/CartType';

interface CartSelectionSidebarProps {
    carts: FormattedCartType[];
    selectedCartId: string | null;
    onSelectCart: (cartId: string) => void;
    onEditCart: (cart: FormattedCartType) => void;
    onDeleteCart: (cartId: string) => void;
}

export const CartSelectionSidebar: FC<CartSelectionSidebarProps> = ({
    carts,
    selectedCartId,
    onSelectCart,
    onEditCart,
    onDeleteCart
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeCart, setActiveCart] = useState<FormattedCartType | null>(null);
    const menuOpen = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, cart: FormattedCartType) => {
        event.stopPropagation(); // Prevent card click
        setAnchorEl(event.currentTarget);
        setActiveCart(cart);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setActiveCart(null);
    };

    const handleEdit = () => {
        if (activeCart) {
            onEditCart(activeCart);
            handleMenuClose();
        }
    };

    const handleDelete = () => {
        if (activeCart) {
            onDeleteCart(activeCart.id);
            handleMenuClose();
        }
    };

    return (
        <Box className="min-w-[300px] rounded-lg pt-6 space-y-4">
            {carts.map((cart) => (
                <Card
                    className={`${selectedCartId === cart.id ? 'bg-utama' : 'bg-white'}`}
                    key={cart.id}
                    variant="outlined"
                    sx={{
                        borderColor: selectedCartId === cart.id ? 'primary.main' : 'grey.300',
                        color: selectedCartId === cart.id ? 'white' : 'text.primary',
                        transition: 'all 0.2s',
                    }}
                >
                    <CardActionArea onClick={() => onSelectCart(cart.id)} sx={{ p: 2 }}>
                        <Box className="flex items-center gap-3 justify-between">
                            <Box className="flex items-center gap-3">
                                <MdShoppingCart className="text-2xl" />
                                <Box>
                                    <Typography fontWeight="bold">{cart.cart_name}</Typography>
                                    <Typography variant="body2">
                                        {formattedDate(new Date(cart.schedule))}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={(e) => handleMenuOpen(e, cart)}>
                                <MoreVertIcon className={`${selectedCartId === cart.id ? 'text-white' : ''}`} fontSize="small" />
                            </IconButton>
                        </Box>
                    </CardActionArea>
                </Card>
            ))}

            {/* Dropdown Menu */}
            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </Menu>
        </Box>
    );
};

export default CartSelectionSidebar;
