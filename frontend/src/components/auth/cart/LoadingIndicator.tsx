import { FC } from 'react';
import { Box } from "@mui/material";
import { FaSpinner } from "react-icons/fa";

export const LoadingIndicator: FC = () => (
    <Box className="w-full min-h-[300px] flex flex-col justify-center items-center gap-4">
        <FaSpinner className="animate-spin text-purple-600 text-3xl" />
        <p className="text-utama text-lg">Loading...</p>
    </Box>
);

export default LoadingIndicator;