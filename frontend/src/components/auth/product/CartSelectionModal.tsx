import { Dialog, DialogTitle, DialogContent, IconButton, Box } from "@mui/material";
import { Close } from "@mui/icons-material";
import { FaSpinner } from "react-icons/fa";
import { FormattedCartType } from "@/utils/types/CartType";
import { FormattedProductType } from "@/utils/types/ProductType";
import { ModalCartList } from "./ModalCartList";
import { SelectedProductInfo } from "./SelectedProductInfo";
import { useState } from "react";
import { CartDrawer } from "../cart/CartDrawer";


interface CartSelectionModalProps {
    open: boolean;
    onClose: () => void;
    carts: FormattedCartType[];
    loadingCart: boolean;
    selectedProduct: FormattedProductType | null;
    qty: number;
    onQtyChange: (value: number) => void;
    onSelectCart: (cartId: string) => void;
}

const CartSelectionModal = ({
    open,
    onClose,
    carts,
    loadingCart,
    selectedProduct,
    qty,
    onQtyChange,
    onSelectCart
}: CartSelectionModalProps) => {
    const [drawerOpen, setDrawerOpen] = useState(false); // State untuk membuka drawer
    const [selectedCart, setSelectedCart] = useState<FormattedCartType | null>(null); // Untuk menyimpan cart yang dipilih

    const handleOpenDrawer = () => {
        setSelectedCart(null); // Reset selectedCart
        setDrawerOpen(true);
        onClose()
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false); // Menutup drawer
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    Pilih Keranjang
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {loadingCart ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100px">
                            <FaSpinner className="animate-spin text-purple-600 text-2xl" />
                        </Box>
                    ) : (
                        <>
                            <ModalCartList openDrawer={handleOpenDrawer} carts={carts} onSelectCart={onSelectCart} />

                            {selectedProduct && (
                                <SelectedProductInfo
                                    product={selectedProduct}
                                    qty={qty}
                                    onQtyChange={onQtyChange}
                                />
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
            <CartDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                editMode={false}
                cart={selectedCart}
                onSuccess={() => {
                    handleCloseDrawer();
                    // Update data atau lakukan sesuatu setelah operasi sukses
                }}
            />
        </>
    );
}

export default CartSelectionModal