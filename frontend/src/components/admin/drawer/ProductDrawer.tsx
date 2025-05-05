import { useState, useEffect, useCallback } from "react";
import {
    Drawer,
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    IconButton,
    Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { ProductRequest, FormattedProductType, SpecificationField } from "@/utils/types/ProductType";
import { useNotification } from "@/hooks/useNotification";
import productService from "@/services/product/productService";
import { formatToRupiah } from "@/utils/priceFormated";
import { createSpecificationsJson, parseSpecificationsJson } from "@/utils/helpers/productHelpers";
import ProductBasicInfo from "../products/ProductBasicInfo";
import ProductSpecifications from "../products/ProductSpecifications";
import ProductStatus from "../products/ProductStatus";
import ProductVariants from "../products/ProductVariants";
import ProductImages from "../products/ProductImages";
import { FormattedCategoryType } from "@/utils/types/CategoryType";
import categoryService from "@/services/category/categoryService";

interface ProductDrawerProps {
    open: boolean;
    onClose: () => void;
    editMode: boolean;
    product: FormattedProductType | null;
    onSuccess: () => void;
}

export const ProductDrawer = ({
    open,
    onClose,
    editMode,
    product,
    onSuccess,
}: ProductDrawerProps) => {
    const [categories, setCategories] = useState<FormattedCategoryType[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [displayPrice, setDisplayPrice] = useState('');
    const [specFields, setSpecFields] = useState<SpecificationField[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [images, setImages] = useState<any[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const { showNotification } = useNotification();
    const [is_active] = useState<boolean>(true)

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductRequest>({
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            stock: 0,
            category_id: "",
            specifications: "",
            is_published: true,
            is_featured: false,
            variants: [],
            images: [],
            images_to_delete: [],
        }
    });

    const fetchCategories = useCallback(async () => {
        try {
            const response = await categoryService.getCategories({ is_active });
            setCategories(response.categoriesFormatted);
        } catch (error) {
            if (error instanceof Error) {
                showNotification(error.message, "error");
            } else {
                showNotification("Failed to fetch categories", "error");
            }
        }
    }, [showNotification]);

    useEffect(() => {
        if (open) {
            fetchCategories();
            resetForm();
        }
    }, [open, editMode, product, fetchCategories]);

    const resetForm = () => {
        if (editMode && product) {
            reset({
                name: product.name,
                description: product.description || "",
                price: product.price,
                stock: product.stock,
                category_id: product.category.id,
                specifications: product.specifications,
                is_published: product.is_published,
                is_featured: product.is_featured || false,
            });
            setDisplayPrice(formatToRupiah(product.price));
            setSpecFields(parseSpecificationsJson(product.specifications));

            // Set variants if product has them
            setVariants(product.variants || []);

            // Set images if product has them
            setImages(product.images || []);
            setImagesToDelete([]);
        } else {
            reset({
                name: "",
                description: "",
                price: 0,
                stock: 0,
                category_id: "",
                specifications: "",
                is_published: true,
                is_featured: false,
            });
            setDisplayPrice('');
            setSpecFields([{ key: "", value: "", id: Math.random().toString(36).substr(2, 9) }]);
            setVariants([]);
            setImages([]);
            setImagesToDelete([]);
        }
    };

    const onSubmit = async (data: ProductRequest) => {
        try {
            setSubmitting(true);
            const specificationsJson = createSpecificationsJson(specFields);

            // Prepare form data for multipart/form-data
            const formData = new FormData();

            // Add basic product data
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('price', data.price.toString());
            formData.append('stock', data.stock.toString());
            formData.append('category_id', data.category_id);
            formData.append('specifications', specificationsJson);
            formData.append('is_published', data.is_published ? '1' : '0');
            formData.append('is_featured', data.is_featured ? '1' : '0');

            // Add variants
            variants.forEach((variant, index) => {
                formData.append(`variants[${index}][name]`, variant.name);

                if (variant.id) {
                    formData.append(`variants[${index}][id]`, variant.id);
                }

                // Kirim langsung sebagai string tanpa JSON.stringify
                formData.append(`variants[${index}][options]`, variant.options);
            });

            // Add images to delete
            imagesToDelete.forEach((imageId, index) => {
                formData.append(`images_to_delete[${index}]`, imageId);
            });

            // Add existing and new images
            images.forEach((image, index) => {
                if (image.id) {
                    formData.append(`images[${index}][id]`, image.id);
                }

                // Ensure image.file is a valid file before appending
                if (image.file && image.file instanceof File) {
                    formData.append(`images[${index}][file]`, image.file);
                } else if (!image.file) {
                    console.log(`Image ${index} has no file attached.`);
                }

                formData.append(`images[${index}][is_primary]`, image.is_primary ? '1' : '0');
            });

            let response;

            // Call appropriate service method based on whether we're in edit mode
            if (editMode && product) {
                response = await productService.updateProduct(product.id, formData);
                showNotification("Product berhasil diperbarui", "success");
            } else {
                response = await productService.createProduct(formData);
                handleCreateResponse(response);
            }

            // Finalize form submission
            onSuccess();
            onClose();
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Failed to save product", "error");
        } finally {
            setSubmitting(false);
        }
    };


    const handleCreateResponse = (response: any) => {
        if (response.status === 500 || response.status === 400) {
            showNotification(response.message ?? "Product gagal dibuat", "error");
        } else if (response.status === 201) {
            showNotification("Product berhasil dibuat", "success");
        } else {
            showNotification("Terjadi kesalahan saat membuat product", "error");
        }
    };

    const handleAddVariant = () => {
        setVariants([
            ...variants,
            {
                name: '',
                options: [''],
                id: null
            }
        ]);
    };

    const handleUpdateVariant = (index: number, data: any) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = { ...updatedVariants[index], ...data };
        setVariants(updatedVariants);
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleAddImage = (files: File[]) => {
        const newImages = files.map(file => ({
            file,
            is_primary: images.length === 0, // First image is primary by default
        }));

        setImages([...images, ...newImages]);
    };

    const handleRemoveImage = (index: number) => {
        const imageToRemove = images[index];
        if (imageToRemove.id) {
            setImagesToDelete([...imagesToDelete, imageToRemove.id]);
        }
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSetPrimaryImage = (index: number) => {
        const updatedImages = images.map((img, i) => ({
            ...img,
            is_primary: i === index
        }));
        setImages(updatedImages);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: "100%", sm: 500 } },
            }}
        >
            <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">{editMode ? "Edit Product" : "Add New Product"}</Typography>
                    <IconButton onClick={onClose} edge="end">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <ProductBasicInfo
                            control={control}
                            errors={errors}
                            submitting={submitting}
                            displayPrice={displayPrice}
                            setDisplayPrice={setDisplayPrice}
                            setValue={setValue}
                            categories={categories}
                        />

                        <Divider />

                        <ProductSpecifications
                            specFields={specFields}
                            setSpecFields={setSpecFields}
                            submitting={submitting}
                        />

                        <Divider />

                        <ProductVariants
                            variants={variants}
                            onAddVariant={handleAddVariant}
                            onUpdateVariant={handleUpdateVariant}
                            onRemoveVariant={handleRemoveVariant}
                            submitting={submitting}
                        />

                        <Divider />

                        <ProductImages
                            images={images}
                            onAddImages={handleAddImage}
                            onRemoveImage={handleRemoveImage}
                            onSetPrimaryImage={handleSetPrimaryImage}
                            submitting={submitting}
                        />

                        <Divider />

                        <ProductStatus
                            control={control}
                            submitting={submitting}
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-utama"
                                type="submit"
                                variant="contained"
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} /> : null}
                            >
                                {submitting ? "Saving..." : editMode ? "Update" : "Create"}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Box>
        </Drawer>
    );
};

export default ProductDrawer;