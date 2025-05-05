import { Grid, Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import productService from "@/services/product/productService";
import { FormattedProductType } from "@/utils/types/ProductType";
import { useNotification } from "@/hooks/useNotification";
import { formatToRupiah } from "@/utils/priceFormated";
import Content from "@/components/ui/content/Content";
import { ContentHead } from "@/components/ui/content/ContentHead";
import { Delete } from "@mui/icons-material";
import { MdArrowBack } from "react-icons/md";

interface Specifications {
    [key: string]: string;
}

export default function ProductDetail() {
    const [product, setProduct] = useState<FormattedProductType | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchParams] = useSearchParams();
    const productId = searchParams.get("productId");
    const { showNotification } = useNotification();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const navigate = useNavigate()

    const fetchProduct = useCallback(async () => {
        if (!productId) return;

        try {
            setLoading(true);
            const response = await productService.getProduct(productId);
            if (response.productFormatted) {
                setProduct(response.productFormatted);
            } else {
                showNotification("Produk tidak ditemukan", "warning");
            }
        } catch (error) {
            if (error instanceof Error) {
                showNotification(error.message, "error");
            } else {
                showNotification("Gagal mengambil produk", "error");
            }
        } finally {
            setLoading(false);
        }
    }, [productId, showNotification]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const handleImageSelect = (filePath: string) => {
        setSelectedImage(filePath);
    };
    const handleBack = () => {
        navigate(-1);
    };

    const handleDeleteProduct = async () => {
        try {
            if (productId) {
                await productService.deleteProduct(productId);
                showNotification("Product berhasil dihapus", "success");
                navigate('/admin/product');
            }
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Failed to delete product", "error");
        }
    };

    const imageToShow =
        selectedImage ||
        product?.images.find((img) => img.is_primary)?.file_path;

    return (
        <Content>
            <ContentHead title="Product Detail" subTitle="">
                <div className='flex space-x-4'>
                    <button
                        className="flex items-center px-4 border-2 border-slate-500 py-2 text-sm font-semibold text-slate-500 rounded-md transition hover:bg-slate-200"
                        onClick={handleBack}
                    >
                        <MdArrowBack className="h-5 w-5 mr-1" />
                        Back
                    </button>
                    <button
                        className="flex items-center px-4 py-2 text-sm font-semibold text-white rounded-md transition bg-gradient-to-br from-orange-400 to-red-700 hover:brightness-105"
                        onClick={handleDeleteProduct}
                    >
                        <Delete className="h-5 w-5 mr-1" />
                        Discard
                    </button>
                </div>
            </ContentHead>

            {loading ? (
                <Typography variant="body1">Loading...</Typography>
            ) : product ? (
                <Grid container spacing={3}>
                    {/* Product Image */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Card>
                            <CardMedia
                                component="img"
                                image={`${import.meta.env.VITE_API_URL}/${imageToShow}`}
                                alt={product.name}
                                sx={{
                                    height: 240,
                                    objectFit: "contain",
                                    borderRadius: "10px 10px 0 0",
                                }}
                            />
                        </Card>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Other Images:</Typography>
                                <Grid container spacing={1}>
                                    {product.images.map((image) => (
                                        <Grid size={{ xs: 4 }} key={image.id}>
                                            <Card onClick={() => handleImageSelect(image.file_path ? image.file_path : "")}>
                                                <CardMedia
                                                    component="img"
                                                    image={`${import.meta.env.VITE_API_URL}/${image.file_path}`}
                                                    alt="product-image"
                                                    sx={{
                                                        height: 100,
                                                        objectFit: "contain",
                                                        cursor: "pointer",
                                                        borderRadius: "5px",
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                        },
                                                    }}
                                                />
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Product Information */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="div" gutterBottom>
                                    {product.name}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {product.description}
                                </Typography>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    {formatToRupiah(product.price)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    <strong>Category:</strong> {product.category.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    <strong>Stock:</strong> {product.stock} available
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    <strong>Create Date</strong> {product.created_at_formatted}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Product Specifications */}
                        <Card sx={{ marginTop: 2 }}>
                            <CardContent>
                                <Typography variant="h6">Specifications:</Typography>
                                <Box>
                                    {product.specifications &&
                                        Object.entries(JSON.parse(product.specifications) as Specifications).map(
                                            ([key, value]) => (
                                                <Typography key={key} variant="body2" color="text.secondary">
                                                    <strong>{key}: </strong>{value}
                                                </Typography>
                                            )
                                        )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Product Variants */}
                        <Card sx={{ marginTop: 2 }}>
                            <CardContent>
                                <Typography variant="h6">Variants:</Typography>
                                {product.variants.map((variant) => (
                                    <Box key={variant.id}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>{variant.name}</strong>:{" "}
                                            {typeof variant.options === 'string'
                                                ? JSON.parse(variant.options).join(", ")
                                                : Array.isArray(variant.options)
                                                    ? variant.options.join(", ")
                                                    : ''}
                                        </Typography>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            ) : (
                <Typography variant="body1">Produk tidak ditemukan.</Typography>
            )}
        </Content>
    );
}
