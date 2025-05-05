// src/components/products/ProductDrawer.tsx
import { useState, useEffect } from "react";
import {
    Drawer,
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    IconButton,
    TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form";
import { useNotification } from "@/hooks/useNotification";
import { FormattedPaymentMethodType, PaymentMethodRequest } from "@/utils/types/PaymentMethodType";
import paymentMethodService from "@/services/paymentMethod/paymentMethod";

interface ProductDrawerProps {
    open: boolean;
    onClose: () => void;
    editMode: boolean;
    paymentMethod: FormattedPaymentMethodType | null;
    onSuccess: () => void;
}

export const PaymentMethodDrawer = ({
    open,
    onClose,
    editMode,
    paymentMethod,
    onSuccess,
}: ProductDrawerProps) => {
    const [submitting, setSubmitting] = useState(false);
    const { showNotification } = useNotification();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<PaymentMethodRequest>({
        defaultValues: {
            name: "",
            description: "",
        }
    });


    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open, editMode, paymentMethod]);


    const resetForm = () => {
        if (editMode && paymentMethod) {
            reset({
                name: paymentMethod.name,
                description: paymentMethod.description || "",
            });

        } else {
            reset({
                name: "",
                description: "",
            });
        }
    };

    const onSubmit = async (data: PaymentMethodRequest) => {
        try {
            setSubmitting(true);
            if (editMode && paymentMethod) {
                const response = await paymentMethodService.updatePaymentMethod(paymentMethod.id, data);
                if (response && response.message && response.payment_method) {
                    showNotification("PaymentMethod berhasil diperbarui", "success");
                } else {
                    showNotification("Gagal mengedit data", "error");
                }
            } else {
                const response = await paymentMethodService.createPaymentMethod(data);
                handleCreateResponse(response);
            }
            onSuccess();
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Failed to save payment method", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateResponse = (response: any) => {
        if (response.status === 500 || response.status === 400) {
            showNotification(response.message ?? "Product gagal dibuat", "error");
        } else if (response.status === 201) {
            showNotification("Product berhasil dibuat", "success");
        } else {
            showNotification("Terjadi kesalahan saat membuat product", "error");
        }
    };


    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: "100%", sm: 350 } },
            }}
        >
            <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">{editMode ? "Edit Payment Method" : "Add New Payment Method"}</Typography>
                    <IconButton onClick={onClose} edge="end">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <Controller
                            name="name"
                            control={control}
                            rules={{
                                required: "Nama kategori wajib diisi",
                                maxLength: {
                                    value: 255,
                                    message: "Nama tidak boleh lebih dari 255 karakter"
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nama Method"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    disabled={submitting}
                                />
                            )}
                        />
                        <Controller
                            name="description"
                            control={control}
                            rules={{
                                maxLength: {
                                    value: 500,
                                    message: "Deskripsi tidak boleh lebih dari 500 karakter"
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Deskripsi"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    error={!!errors.description}
                                    helperText={errors.description?.message}
                                    disabled={submitting}
                                />
                            )}
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-utama"
                                type="submit"
                                variant="contained"
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} /> : null}
                            >
                                {submitting ? "Saving..." : editMode ? "Update" : "Create"}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Box>
        </Drawer>
    );
};

export default PaymentMethodDrawer;