// BankOption.tsx
import { FC } from "react";
import { Paper, Typography } from "@mui/material";
import { FormattedPaymentMethodType } from "@/utils/types/PaymentMethodType";

interface BankOptionProps {
    bank: FormattedPaymentMethodType['banks'][0];
    isSelected: boolean;
    onSelect: () => void;
}

export const BankOption: FC<BankOptionProps> = ({
    bank,
    isSelected,
    onSelect,
}) => {
    return (
        <Paper
            sx={{
                backgroundColor: "transparent",
                p: 2,
                border: isSelected ? "1px solid" : "none",
                borderColor: isSelected ? "primary.main" : "transparent",
                borderRadius: 2,
                cursor: "pointer",
                "&:hover": {
                    borderColor: "primary.light",
                },
            }}
            onClick={onSelect}
        >
            <Typography variant="subtitle1">{bank.name}</Typography>
            <Typography variant="body2">{bank.no_rek}</Typography>
            <Typography variant="body2">An: {bank.an}</Typography>
        </Paper>
    );
};

export default BankOption;