// CartCheckoutDialog.tsx - Main Component
import { ChangeEvent, FC, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Typography,
    DialogActions,
    Button,
} from "@mui/material";
import { FormattedCartType } from "@/utils/types/CartType";
import { formatToRupiah } from "@/utils/priceFormated";
import { FormattedPaymentMethodType } from "@/utils/types/PaymentMethodType";
import { OrderSummary } from "./OrderSummary";
import { BankSelectionDialog } from "./BankSelectionDialog";
import PaymentSelection from "./PaymentSelection";
import orderService from "@/services/order/orderService";
import { useNotification } from "@/hooks/useNotification";

interface CartCheckoutDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    cart: FormattedCartType | undefined;
    qtyMap: Record<string, number>;
    paymentMethods: FormattedPaymentMethodType[];
}

export const CartCheckoutDialog: FC<CartCheckoutDialogProps> = ({
    open,
    onClose,
    cart,
    qtyMap,
    paymentMethods,
    onSuccess
}) => {
    const [selectedBank, setSelectedBank] = useState<FormattedPaymentMethodType['banks'][0] | null>(null);
    const [bankDialogOpen, setBankDialogOpen] = useState(false);
    const [selectedProofFile, setSelectedProofFile] = useState<File | null>(null);
    const { showNotification } = useNotification()

    const handleProofFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isPDF = file.type === "application/pdf";
        const sizeKB = file.size / 1024;

        if (!isPDF) {
            alert("File harus berupa PDF.");
            return;
        }

        if (sizeKB < 100 || sizeKB > 500) {
            alert("Ukuran file harus antara 100KB hingga 500KB.");
            return;
        }

        setSelectedProofFile(file);
    };
    if (!cart) return null;

    const total = cart.products.reduce((sum, item) => {
        const qty = qtyMap[item.cart_item_id] ?? item.qty ?? 1;
        return sum + parseFloat(item.price) * qty;
    }, 0);

    const handleOpenBankDialog = () => {
        setBankDialogOpen(true);
    };

    const handleCloseBankDialog = () => {
        setBankDialogOpen(false);
    };

    const handleBankSelection = (bank: FormattedPaymentMethodType['banks'][0]) => {
        setSelectedBank(bank);
        setBankDialogOpen(false);
    };

    const handleCheckout = async () => {
        if (!selectedBank) return;

        const formData = new FormData();

        const items = cart.products.map((item) => {
            const qty = Number(qtyMap[item.cart_item_id] ?? item.qty ?? 1); // pastikan ini number
            return {
                product_id: item.product_id,
                product_name: item.name,
                price: parseInt(item.price),
                qty,
            };
        });

        const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);

        formData.append("items", JSON.stringify(items));
        formData.append("total_qty", totalQty.toString());
        formData.append("total_price", totalPrice.toString());
        formData.append("bank_id", selectedBank.id);
        formData.append("cart_id", cart.id);
        formData.append("payment_date", new Date().toISOString().split("T")[0]); // today (YYYY-MM-DD)

        if (selectedProofFile) {
            formData.append("proof", selectedProofFile);
        }

        try {
            const result = await orderService.createOrder(formData);
            if (result.message && result.status) {
                showNotification(result.message, 'success')
                console.log("Order berhasil:", result);
                onSuccess()
                onClose(); // Tutup dialog
            }

        } catch (error: any) {
            showNotification(error.message, 'error'); // Tampilkan error ke user
            console.error("Gagal checkout:", error);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle fontWeight="bold">Ringkasan Pesanan</DialogTitle>
                <DialogContent dividers sx={{ maxHeight: "75vh" }}>
                    <OrderSummary cart={cart} qtyMap={qtyMap} />

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        Pilih Metode Pembayaran
                    </Typography>

                    <PaymentSelection
                        selectedBank={selectedBank}
                        onSelectBank={handleOpenBankDialog}
                    />
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        Upload Bukti Pembayaran (PDF, 100–500KB)
                    </Typography>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleProofFileChange}
                    />

                    <Divider sx={{ my: 2 }} />
                    <Typography fontWeight="bold" mb={2}>
                        Total: {formatToRupiah(total)}
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} variant="outlined">
                        Batal
                    </Button>
                    <Button
                        onClick={handleCheckout}
                        variant="contained"
                        disabled={!selectedBank}
                    >
                        Konfirmasi Checkout
                    </Button>
                </DialogActions>
            </Dialog>

            <BankSelectionDialog
                open={bankDialogOpen}
                onClose={handleCloseBankDialog}
                paymentMethods={paymentMethods}
                selectedBank={selectedBank}
                onSelectBank={handleBankSelection}
            />
        </>
    );
};

export default CartCheckoutDialog;