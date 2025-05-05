import { useState, useEffect } from "react";
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    CircularProgress,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { useNotification } from "@/hooks/useNotification";
import { FormattedCartType, CartRequest } from "@/utils/types/CartType";
import cartService from "@/services/cart/cartUserService";

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
    editMode: boolean;
    cart: FormattedCartType | null;
    onSuccess: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
    open,
    onClose,
    editMode,
    cart,
    onSuccess
}) => {
    const [submitting, setSubmitting] = useState(false);
    const { showNotification } = useNotification();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<CartRequest>({
        defaultValues: {
            cart_name: "",
            schedule: "",
        }
    });

    useEffect(() => {
        if (open) {
            if (editMode && cart) {
                reset({
                    cart_name: cart.cart_name,
                    schedule: cart.schedule,
                    // Password empty for security
                });
            } else {
                reset({
                    cart_name: "",
                    schedule: "",
                });
            }
        }
    }, [open, editMode, cart, reset]);


    const onSubmit = async (data: CartRequest) => {
        try {
            setSubmitting(true);

            let response;
            if (editMode && cart) {
                // For update, pass the avatarFile to the service
                response = await cartService.updateCart(cart.id, data);
                showNotification("Cart berhasil diperbarui", "success");
            } else {
                // Pass the avatarFile as second parameter
                response = await cartService.createCart(data);

                if (response.status === 500) {
                    showNotification(response.message ?? "Cart gagal dibuat", "error");
                } else if (response.status === 201) {
                    showNotification("Cart berhasil dibuat", "success");
                } else {
                    showNotification("Terjadi kesalahan saat membuat cart", "error");
                }
            }

            onSuccess();
            onClose(); // Close drawer after success
        } catch (error: any) {
            showNotification(error instanceof Error ? error.message : "Failed to save cart", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 } }
            }}
        >
            <Box sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                        {editMode ? "Edit Kategori" : "Tambah Kategori Baru"}
                    </Typography>
                    <IconButton onClick={onClose} edge="end">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <Controller
                            name="cart_name"
                            control={control}
                            rules={{
                                required: "Nama keranjang harus diisi",
                                maxLength: {
                                    value: 255,
                                    message: "Nama tidak boleh lebih dari 255 karakter"
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nama Keranjang"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.cart_name}
                                    helperText={errors.cart_name?.message}
                                    disabled={submitting}
                                />
                            )}
                        />

                        <Controller
                            name="schedule"
                            control={control}
                            rules={{
                                required: "Tanggal wajib diisi",
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Jadwal"
                                    type="date"
                                    InputLabelProps={{
                                        shrink: true, // supaya label tetap tampil di atas
                                    }}
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.schedule}
                                    helperText={errors.schedule?.message}
                                    disabled={submitting}
                                />
                            )}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Batal
                            </Button>
                            <Button
                                className="bg-utama"
                                type="submit"
                                variant="contained"
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} /> : null}
                            >
                                {submitting ? 'Menyimpan...' : editMode ? 'Perbarui' : 'Buat'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Box>
        </Drawer>
    );
};