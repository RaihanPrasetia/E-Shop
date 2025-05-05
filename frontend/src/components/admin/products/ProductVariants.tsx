import {
    Box,
    Typography,
    Button,
    TextField,
    IconButton,
    Stack,
    Card,
    CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface ProductVariantsProps {
    variants: any[];
    onAddVariant: () => void;
    onUpdateVariant: (index: number, data: any) => void;
    onRemoveVariant: (index: number) => void;
    submitting: boolean;
}

const ProductVariants = ({
    variants,
    onAddVariant,
    onUpdateVariant,
    onRemoveVariant,
    submitting,
}: ProductVariantsProps) => {
    const handleOptionChange = (variantIndex: number, options: string) => {
        // Try to parse the option string as JSON to validate it
        try {
            JSON.parse(options);
            onUpdateVariant(variantIndex, { options });
        } catch (error) {
            // If it's not valid JSON, update anyway but it will be validated on submit
            onUpdateVariant(variantIndex, { options });
        }
    };
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Product Variants
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={onAddVariant}
                    disabled={submitting}
                >
                    Add Variant
                </Button>
            </Box>

            {variants.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No variants added yet. Add variants if your product comes in different options like size, color, etc.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {variants.map((variant, index) => (
                        <Card key={index} variant="outlined">
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2">Variant {index + 1}</Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => onRemoveVariant(index)}
                                        disabled={submitting}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Stack spacing={2}>
                                    <TextField
                                        fullWidth
                                        label="Variant Name"
                                        value={variant.name}
                                        onChange={(e) => onUpdateVariant(index, { name: e.target.value })}
                                        placeholder="e.g., Size, Color"
                                        disabled={submitting}
                                        size="small"
                                    />

                                    <TextField
                                        fullWidth
                                        label="Options (JSON Array)"
                                        value={
                                            Array.isArray(variant.options)
                                                ? variant.options.join(",")
                                                : (() => {
                                                    try {
                                                        const parsed = JSON.parse(variant.options);
                                                        return Array.isArray(parsed) ? parsed.join(",") : variant.options;
                                                    } catch {
                                                        return variant.options;
                                                    }
                                                })()
                                        }
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder='e.g., Small, Medium, Large]'
                                        multiline
                                        rows={2}
                                        disabled={submitting}
                                        size="small"
                                        helperText="Enter options as a JSON array"
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default ProductVariants;