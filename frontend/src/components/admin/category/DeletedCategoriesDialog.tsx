import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Button, CircularProgress, Typography } from "@mui/material";
import { FormattedCategoryType } from "@/utils/types/CategoryType";
import { useState } from "react";

interface DeletedCategoriesDialogProps {
    open: boolean;
    onClose: () => void;
    deletedCategories: FormattedCategoryType[];
    loadingDeleted: boolean;
    restoreCategory: (id: string) => void
}

const DeletedCategoriesDialog = ({ open, onClose, deletedCategories, loadingDeleted, restoreCategory }: DeletedCategoriesDialogProps) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false); // State untuk menampilkan dialog konfirmasi
    const [categoryToRestore, setCategoryToRestore] = useState<string | null>(null); // Category yang akan di-restore


    const handleRestoreClick = (id: string) => {
        setCategoryToRestore(id); // Menyimpan ID kategori yang akan dipulihkan
        setShowConfirmDialog(true); // Menampilkan dialog konfirmasi
    };

    const handleConfirmRestore = () => {
        if (categoryToRestore) {
            restoreCategory(categoryToRestore); // Panggil fungsi restoreCategory jika konfirmasi
            setShowConfirmDialog(false); // Menutup dialog konfirmasi
            setCategoryToRestore(null); // Reset ID kategori yang akan dipulihkan
        }
    };

    const handleCancelRestore = () => {
        setShowConfirmDialog(false); // Menutup dialog konfirmasi jika dibatalkan
    };
    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>Deleted Categories</DialogTitle>
                <DialogContent dividers>
                    {loadingDeleted ? (
                        <CircularProgress />
                    ) : deletedCategories.length === 0 ? (
                        <Typography>No deleted categories found.</Typography>
                    ) : (
                        <Grid container spacing={2}>
                            {deletedCategories.map((cat) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.id}>
                                    <div
                                        style={{
                                            border: "1px solid #ccc",
                                            borderRadius: "8px",
                                            padding: "16px",
                                            backgroundColor: "#f9f9f9",
                                            cursor: "pointer",
                                            transition: "transform 0.2s ease-in-out",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#e0f7fa"; // Warna latar belakang saat hover
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f9f9f9"; // Warna latar belakang normal
                                        }}
                                        onClick={() => handleRestoreClick(cat.id)} // Memanggil restoreCategory saat card diklik
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold">{cat.name}</Typography>
                                        <Typography variant="body2">Created at: {cat.created_at_formatted}</Typography>
                                        <Typography variant="body2" color="error">Deleted: {cat.deleted_at_formatted}</Typography>
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={showConfirmDialog}
                onClose={handleCancelRestore}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Restore Category</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to restore this category?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelRestore} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmRestore} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeletedCategoriesDialog;
