// PaymentSelection.tsx
import { FC } from "react";
import { Button, Grid, Typography } from "@mui/material";
import { FormattedPaymentMethodType } from "@/utils/types/PaymentMethodType";

interface PaymentSelectionProps {
    selectedBank: FormattedPaymentMethodType['banks'][0] | null;
    onSelectBank: () => void;
}

export const PaymentSelection: FC<PaymentSelectionProps> = ({
    selectedBank,
    onSelectBank,
}) => {
    return (
        <Grid container spacing={2} display="flex" justifyContent="space-between" alignItems="center">
            {selectedBank ? (
                <Grid size={10}>
                    <Typography variant="subtitle1">
                        Bank: {selectedBank.name}
                    </Typography>
                    <Typography variant="body2">
                        {`Nomor Rekening: ${selectedBank.no_rek}`}
                    </Typography>
                    <Typography variant="body2">
                        An: {selectedBank.an}
                    </Typography>
                </Grid>
            ) : (
                <Grid size={10}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        Silakan pilih metode pembayaran dan bank.
                    </Typography>
                </Grid>
            )}
            <Grid size={2}>
                <Button
                    variant="outlined"
                    onClick={onSelectBank}
                    fullWidth
                >
                    Pilih
                </Button>
            </Grid>
        </Grid>
    );
};

export default PaymentSelection;