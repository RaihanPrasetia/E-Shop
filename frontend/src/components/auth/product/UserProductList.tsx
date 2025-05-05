import { Grid } from "@mui/material";
import { useState, useCallback } from "react";
import { FormattedProductType } from "@/utils/types/ProductType";
import { FormattedCartType } from "@/utils/types/CartType";
import { useNotification } from "@/hooks/useNotification";
import cartService from "@/services/cart/cartUserService";
import ProductCard from "./ProductCard";
import CartSelectionModal from "./CartSelectionModal";
import cartItemService from "@/services/cart/cartItemService,";
import LoadingIndicator from "../cart/LoadingIndicator";
import EmptyProductMessage from "./EmptyProductMessage";

interface UserProductListProp {
    loading: boolean;
    products: FormattedProductType[];
}

interface NotificationHook {
    showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const UserProductList = ({ loading, products }: UserProductListProp) => {
    const [carts, setCarts] = useState<FormattedCartType[]>([]);
    const [loadingCart, setLoadingCart] = useState<boolean>(true);
    const { showNotification } = useNotification() as NotificationHook;
    const [openCartModal, setOpenCartModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [qty, setQty] = useState<number>(1);

    const fetchCarts = useCallback(async (): Promise<void> => {
        try {
            setLoadingCart(true);
            const response = await cartService.getCarts();
            setCarts(response.cartsFormatted);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Gagal mengambil produk";
            showNotification(message, "error");
        } finally {
            setLoadingCart(false);
        }
    }, [showNotification]);

    const handleAddToCart = async (productId: string) => {
        try {
            await fetchCarts();
            setSelectedProductId(productId);
            setOpenCartModal(true);
        } catch (error) {
            showNotification("Gagal membuka daftar keranjang", "error");
        }
    };

    const handleSelectCart = async (cartId: string) => {
        if (!selectedProductId) return;
        try {
            await cartItemService.createCartItem({
                cart_id: cartId,
                product_id: selectedProductId,
                qty: qty,
            });
            showNotification("Produk berhasil ditambahkan ke keranjang", "success");
            setOpenCartModal(false);
            setSelectedProductId(null);
            setQty(1);
            fetchCarts(); // optional refresh
        } catch (error) {
            showNotification("Gagal menambahkan produk ke keranjang", "error");
        }
    };

    const handleCloseModal = () => {
        setOpenCartModal(false);
        setSelectedProductId(null);
        setQty(1);
    };

    if (loading) {
        return <LoadingIndicator />;
    }

    if (!products.length) {
        return <EmptyProductMessage />;
    }

    const selectedProduct = selectedProductId
        ? products.find(product => product.id === selectedProductId)
        : null;

    return (
        <Grid container>
            {products.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id}>
                    <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                    />
                </Grid>
            ))}

            <CartSelectionModal
                open={openCartModal}
                onClose={handleCloseModal}
                carts={carts}
                loadingCart={loadingCart}
                selectedProduct={selectedProduct ? selectedProduct : null}
                qty={qty}
                onQtyChange={(value) => setQty(value)}
                onSelectCart={handleSelectCart}
            />
        </Grid>
    );
};