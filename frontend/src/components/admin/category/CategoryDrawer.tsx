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
    IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { CategoryRequest, FormattedCategoryType } from "@/utils/types/CategoryType";
import { useNotification } from "@/hooks/useNotification";
import categoryService from "@/services/category/categoryService";
import { createSpecificationsJson, parseSpecificationsJson } from "@/utils/helpers/productHelpers";
import { SpecificationField } from "@/utils/types/ProductType";
import CategoryMetadata from "./CategoryMetadata";

interface CategoryDrawerProps {
    open: boolean;
    onClose: () => void;
    editMode: boolean;
    category: FormattedCategoryType | null;
    onSuccess: () => void;
}

export const CategoryDrawer = ({
    open,
    onClose,
    editMode,
    category,
    onSuccess
}: CategoryDrawerProps) => {
    const [submitting, setSubmitting] = useState(false);
    const { showNotification } = useNotification();
    const [specFields, setSpecFields] = useState<SpecificationField[]>([]);


    const { control, handleSubmit, reset, formState: { errors } } = useForm<CategoryRequest>({
        defaultValues: {
            name: "",
            isActive: true,
            metadata: ""
        }
    });

    // Reset form when drawer opens or category changes
    useEffect(() => {
        if (open) {
            if (editMode && category) {
                reset({
                    name: category.name,
                    isActive: category.isActive,
                    metadata: category.metadata,
                });
                setSpecFields(parseSpecificationsJson(category?.metadata));
            } else {
                reset({
                    name: "",
                    isActive: true,
                    metadata: ""
                });
                setSpecFields(parseSpecificationsJson(category?.metadata ? category.metadata : ""));
            }
        }
    }, [open, editMode, category, reset]);

    const onSubmit = async (data: CategoryRequest) => {
        try {
            setSubmitting(true);
            const metaDataJson = createSpecificationsJson(specFields);
            console.log("Submitting form with data:", data);
            const updatedData = {
                ...data,
                metadata: metaDataJson,
            };

            let response;

            if (editMode && category) {
                // Update existing category
                console.log("Updating category ID:", category.id);
                response = await categoryService.updateCategory(category.id, updatedData);
                console.log("Update response:", response);

                if (response.status >= 200 && response.status < 300) {
                    showNotification("Kategori berhasil diperbarui", "success");
                    onSuccess(); // Only call on success
                    onClose(); // Close drawer on success
                } else {
                    showNotification(response.message || "Gagal memperbarui kategori", "error");
                }
            } else {
                // Create new category
                response = await categoryService.createCategory(updatedData);
                console.log("Create response:", response);

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
                sx: { width: { xs: '100%', sm: 400 } }
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
                                    label="Nama Kategori"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    disabled={submitting}
                                />
                            )}
                        />

                        <CategoryMetadata
                            specFields={specFields}
                            setSpecFields={setSpecFields}
                            submitting={submitting}
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