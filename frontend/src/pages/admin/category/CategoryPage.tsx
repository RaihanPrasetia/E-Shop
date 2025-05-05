import { useCallback, useEffect, useState } from "react";
import Content from "@/components/ui/content/Content";
import ContentBody from "@/components/ui/content/ContentBody";
import { ContentHead } from "@/components/ui/content/ContentHead";

import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { CategoryList } from "@/components/admin/category/CategoryList";
import { CategoryDrawer } from "@/components/admin/category/CategoryDrawer";
import categoryService from "@/services/category/categoryService";
import { useNotification } from "@/hooks/useNotification";
import { FormattedCategoryType } from "@/utils/types/CategoryType";
import DeletedCategoriesDialog from "@/components/admin/category/DeletedCategoriesDialog";

export default function CategoryPage() {
    const [categories, setCategories] = useState<FormattedCategoryType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<FormattedCategoryType | null>(null);
    const { showNotification } = useNotification(); // Use the notification hook
    const [showWithDeleted, setShowWithDeleted] = useState(false);
    const [deletedCategories, setDeletedCategories] = useState<FormattedCategoryType[]>([]);
    const [deletedDialogOpen, setDeletedDialogOpen] = useState(false);
    const [loadingDeleted, setLoadingDeleted] = useState(false);

    const fetchCategories = useCallback(
        async (options?: { withDeleted?: boolean; onlyDeleted?: boolean }) => {
            try {
                setLoading(true);
                const response = await categoryService.getCategories({
                    withDeleted: options?.withDeleted,
                    onlyDeleted: options?.onlyDeleted,
                });
                setCategories(response.categoriesFormatted);
            } catch (error) {
                if (error instanceof Error) {
                    showNotification(error.message, "error");
                } else {
                    showNotification("Failed to fetch categories", "error");
                }
            } finally {
                setLoading(false);
            }
        },
        [showNotification]
    );

    useEffect(() => {
        if (showWithDeleted) {
            fetchCategories({ withDeleted: true });
        } else {
            fetchCategories();
        }
    }, [fetchCategories, showWithDeleted]);

    const handleOpenDrawer = (mode: "add" | "edit", category?: FormattedCategoryType) => {
        if (mode === "edit" && category) {
            setSelectedCategory(category);
            setEditMode(true);
        } else {
            setSelectedCategory(null);
            setEditMode(false);
        }
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedCategory(null);
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            await categoryService.deleteCategory(id);
            showNotification("Kategori berhasil dihapus", "success");
            fetchCategories();
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Failed to delete category", "error");
        }
    };

    const handleRestorCategory = async (id: string) => {
        try {
            await categoryService.restoreCategory(id);
            showNotification("Kategori berhasil dihapus", "success");
            fetchCategories();
            fetchDeletedCategories()
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Failed to delete category", "error");
        }
    }

    const fetchDeletedCategories = async () => {
        try {
            setLoadingDeleted(true);
            const response = await categoryService.getCategories({ onlyDeleted: true });
            setDeletedCategories(response.categoriesFormatted);
            setDeletedDialogOpen(true);
        } catch (error) {
            showNotification("Gagal mengambil kategori yang sudah dihapus", "error");
        } finally {
            setLoadingDeleted(false);
        }
    }

    return (
        <Content>
            <ContentHead title="List Category" subTitle="Manage your category here">
                <Button
                    className="bg-utama"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDrawer("add")}
                >
                    Add Category
                </Button>
            </ContentHead>
            <ContentBody>
                <CategoryList
                    categories={categories}
                    loading={loading}
                    onEdit={(category) => handleOpenDrawer("edit", category)}
                    onDelete={handleDeleteCategory}
                    showWithDeleted={showWithDeleted}
                    onToggleWithDeleted={() => setShowWithDeleted((prev) => !prev)}
                    onShowDeletedOnly={fetchDeletedCategories}
                />
            </ContentBody>

            <DeletedCategoriesDialog
                open={deletedDialogOpen}
                onClose={() => setDeletedDialogOpen(false)}
                deletedCategories={deletedCategories}
                loadingDeleted={loadingDeleted}
                restoreCategory={handleRestorCategory}
            />

            <CategoryDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                editMode={editMode}
                category={selectedCategory}
                onSuccess={() => {
                    handleCloseDrawer();
                    fetchCategories();
                }}
            />
        </Content>
    );
}
