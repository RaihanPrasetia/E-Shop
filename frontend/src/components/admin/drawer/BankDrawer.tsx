import { useState, useEffect } from "react";
import {
    Drawer,
    Box,
    Typography,
    TextField,
    FormControlLabel,
    Switch,
    Button,
    Stack,
    CircularProgress,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { BankRequest, FormattedBankType } from "@/utils/types/BankTypes";
import { useNotification } from "@/hooks/useNotification";
import bankService from "@/services/bank/bankService";
import { FormattedPaymentMethodType } from "@/utils/types/PaymentMethodType";

interface BankDrawerProps {
    methods: FormattedPaymentMethodType[];
    open: boolean;
    onClose: () => void;
    editMode: boolean;
    bank: FormattedBankType | null;
    onSuccess: () => void;
}

export const BankDrawer = ({
    open,
    onClose,
    editMode,
    bank,
    methods,
    onSuccess
}: BankDrawerProps) => {
    const [submitting, setSubmitting] = useState(false);
    const { showNotification } = useNotification();


    const { control, handleSubmit, reset, formState: { errors } } = useForm<BankRequest>({
        defaultValues: {
            name: "",
            isActive: true,
            payment_method_id: "",
            an: "",
            no_rek: ""
        }
    });

    // Reset form when drawer opens or bank changes
    useEffect(() => {
        if (open) {
            if (editMode && bank) {
                reset({
                    name: bank.name,
                    isActive: bank.isActive,
                    payment_method_id: bank.payment_method_id,
                    an: bank.an,
                    no_rek: bank.no_rek,
                });
            } else {
                reset({
                    name: "",
                    isActive: true,
                    payment_method_id: '',
                    an: "",
                    no_rek: ""
                });
            }
        }
    }, [open, editMode, bank, reset]);

    const onSubmit = async (data: BankRequest) => {
        try {
            setSubmitting(true);

            if (editMode && bank) {
                // Update existing bank
                console.log("Updating bank ID:", bank.id);
                const response = await bankService.updateBank(bank.id, data);
                console.log("Update response:", response);

                if (response.status >= 200 && response.status < 300) {
                    showNotification("Kategori berhasil diperbarui", "success");
                    onSuccess();
                    onClose();
                } else {
                    showNotification(response.message || "Gagal memperbarui kategori", "error");
                }
            } else {
                // Create new bank
                const response = await bankService.createBank(data);

                if (response.status === 201) {
                    showNotification("Kategori berhasil dibuat", "success");
                    onSuccess(); // Only call on success
                    onClose(); // Close drawer on success
                } else if (response.status === 409) {
                    showNotification("Kategori dengan nama ini sudah ada", "error");
                } else {
                    showNotification(response.message || "Gagal membuat kategori", "error");
                }
            }
        } catch (error) {
            console.error("Error in form submission:", error);
            showNotification(
                error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan kategori",
                "error"
            );
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
                sx: { width: { xs: '100%', sm: 350 } }
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
                            name="payment_method_id"
                            control={control}
                            rules={{ required: "Metode pembayaran wajib dipilih" }}
                            render={({ field }) => (
                                <FormControl fullWidth variant="outlined" error={!!errors.payment_method_id} disabled={submitting}>
                                    <InputLabel id="payment-method-label">Metode Pembayaran</InputLabel>
                                    <Select
                                        {...field}
                                        labelId="payment-method-label"
                                        label="Metode Pembayaran"
                                    >
                                        {methods.map((method) => (
                                            <MenuItem key={method.id} value={method.id}>
                                                {method.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        />

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
                                    label="Nama Bank"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    disabled={submitting}
                                />
                            )}
                        />
                        <Controller
                            name="an"
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
                                    label="Atas Nama"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    disabled={submitting}
                                />
                            )}
                        />
                        <Controller
                            name="no_rek"
                            control={control}
                            rules={{
                                required: "Nomor rekening wajib diisi",
                                maxLength: {
                                    value: 255,
                                    message: "Nama tidak boleh lebih dari 255 karakter"
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nomor Rekening"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    disabled={submitting}
                                />
                            )}
                        />

                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={value}
                                            onChange={onChange}
                                            disabled={submitting}
                                        />
                                    }
                                    label="Aktif"
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