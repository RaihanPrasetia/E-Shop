import { Box, List, ListItem, Typography } from "@mui/material";

const renderJsonFormat = (dataJson: string) => {
    try {
        const specs = JSON.parse(dataJson);
        if (specs) {
            return (
                <List dense disablePadding>
                    {Object.entries(specs).map(([key, value]) => (
                        <ListItem key={key} disablePadding sx={{ py: 0.5 }}>
                            <Typography variant="body2" component="span">
                                <Box component="span" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                    {key.replace(/_/g, ' ')}
                                </Box>
                                {`: ${value}`}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            );
        }
        if (specs === null) {
            return <span> Tidak ada data </span>
        }
    } catch (error) {
        console.error(error)
        return <span>  Invalid data format</span>;
    }
};

export default renderJsonFormat