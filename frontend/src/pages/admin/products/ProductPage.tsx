import { useCallback, useEffect, useState } from "react";
import Content from "@/components/ui/content/Content";
import ContentBody from "@/components/ui/content/ContentBody";
import { ContentHead } from "@/components/ui/content/ContentHead";

import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import productService from "@/services/product/productService";
import { useNotification } from "@/hooks/useNotification";
import { FormattedProductType } from "@/utils/types/ProductType";
import { ProductList } from "@/components/admin/products/ProductList";
import { ProductDrawer } from "@/components/admin/drawer/ProductDrawer";
import { ImportExport } from "@mui/icons-material";

export default function ProductPage() {
    const [products, setProducts] = useState<FormattedProductType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<FormattedProductType | null>(null);
    const { showNotification } = useNotification(); // Use the notification hook


    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productService.getProducts();
            setProducts(response.productsFormatted);
        } catch (error) {
            if (error instanceof Error) {
                showNotification(error.message, "error");
            } else {
                showNotification("Failed to fetch products", "error");
            }
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleOpenDrawer = (mode: "add" | "edit", product?: FormattedProductType) => {
        if (mode === "edit" && product) {
            setSelectedProduct(product);
            setEditMode(true);
        } else {
            setSelectedProduct(null);
            setEditMode(false);
        }
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedProduct(null);
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            await productService.deleteProduct(id);
            showNotification("Kategori berhasil dihapus", "success");
            fetchProducts();
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Failed to delete product", "error");
        }
    };

    const handleImportProduct = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xlsx";

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            try {
                await productService.importProduct(formData); // Buat di langkah 2
                showNotification("Import produk berhasil", "success");
                fetchProducts();
            } catch (error) {
                showNotification(error instanceof Error ? error.message : "Gagal import produk", "error");
            }
        };

        input.click();
    };

    return (
        <Content>
            <ContentHead title="List Product" subTitle="Manage your product here">
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<ImportExport />}
                        onClick={() => handleImportProduct()}
                    >
                        Import
                    </Button>
                    <Button
                        className="bg-utama"
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDrawer("add")}
                    >
                        Add Product
                    </Button>

                </Box>
            </ContentHead>
            <ContentBody>
                <ProductList
                    products={products}
                    loading={loading}
                    onEdit={(product) => handleOpenDrawer("edit", product)}
                    onDelete={handleDeleteProduct}
                />
            </ContentBody>

            <ProductDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                editMode={editMode}
                product={selectedProduct}
                onSuccess={() => {
                    handleCloseDrawer();
                    fetchProducts();
                }}
            />
        </Content>
    );
}
