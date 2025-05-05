// BankSelectionDialog.tsx
import { FC } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
    Grid,
} from "@mui/material";
import { FormattedPaymentMethodType } from "@/utils/types/PaymentMethodType";
import { BankOption } from "./BankOption";

interface BankSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    paymentMethods: FormattedPaymentMethodType[];
    selectedBank: FormattedPaymentMethodType['banks'][0] | null;
    onSelectBank: (bank: FormattedPaymentMethodType['banks'][0]) => void;
}

export const BankSelectionDialog: FC<BankSelectionDialogProps> = ({
    open,
    onClose,
    paymentMethods,
    selectedBank,
    onSelectBank,
}) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Pilih Bank</DialogTitle>
            <DialogContent dividers>
                {paymentMethods.map((paymentMethod) => (
                    <div key={paymentMethod.id}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                            {paymentMethod.name}
                        </Typography>

                        {paymentMethod.banks.length > 0 ? (
                            <Grid container spacing={2}>
                                {paymentMethod.banks.map((bank) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={bank.id}>
                                        <BankOption
                                            bank={bank}
                                            isSelected={selectedBank?.id === bank.id}
                                            onSelect={() => onSelectBank(bank)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Tidak ada bank tersedia untuk metode pembayaran ini.
                            </Typography>
                        )}
                    </div>
                ))}
            </DialogContent>
        </Dialog>
    );
};

export default BankSelectionDialog;