import { Box, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface PaymentFilterProps {
    searchTerm: string;
    handleSearchChange: (value: string) => void;
    pagination: number;
    setPagination: (value: number) => void;
}

const PaymentFilter = ({ searchTerm, handleSearchChange, pagination, setPagination }: PaymentFilterProps) => {
    return (
        <Box className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            {/* Search Input */}
            <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Rows Per Page Selector */}
            <TextField
                select
                label="Rows per page"
                variant="outlined"
                size="small"
                value={pagination}
                onChange={(e) => setPagination(Number(e.target.value))}
            >
                {[5, 10, 25, 50].map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    );
};

export default PaymentFilter;
