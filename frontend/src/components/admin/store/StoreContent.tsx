import { Typography, Box, Button } from "@mui/material";

const StoreContent = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Store Content
            </Typography>
            <Button variant="contained" color="primary">
                Go to Store
            </Button>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
                This is the content for the Store section.
            </Typography>
        </Box>
    );
};

export default StoreContent;
