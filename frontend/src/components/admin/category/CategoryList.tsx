import { useState } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Tooltip,
    Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { FormattedCategoryType } from "@/utils/types/CategoryType";
import { ConfirmationDialog } from "../../ui/ConfirmationDialog";
import { FaEye, FaSpinner } from "react-icons/fa";
import Pagination from "../../ui/Pagination";
import CustomeFilter from "../../ui/CustomeFilter";
import renderJsonFormat from "@/utils/helpers/renderJsonFormat";

type CategoryListProps = {
    categories: FormattedCategoryType[];
    loading: boolean;
    onEdit: (category: FormattedCategoryType) => void;
    onDelete: (id: string) => void;
    onToggleWithDeleted?: () => void;
    showWithDeleted?: boolean;
    onShowDeletedOnly?: () => void;
};

export const CategoryList = ({ categories, loading, onEdit, onDelete, onShowDeletedOnly, onToggleWithDeleted, showWithDeleted }: CategoryListProps) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<FormattedCategoryType | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset ke halaman pertama setelah search
    };

    const handleDeleteClick = (category: FormattedCategoryType) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (categoryToDelete) {
            onDelete(categoryToDelete.id);
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        }
    };

    // Filter kategori berdasarkan searchTerm
    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);

    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <Box className="w-full h-[200px] flex flex-col justify-center items-center gap-4">
                <FaSpinner className="animate-spin text-primary text-3xl" />
                <p className="text-gray-600 text-lg">Loading...</p>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ width: '100%' }}>
                {/* === Custom Filter (Show per Page + Search) === */}
                <CustomeFilter
                    pagination={rowsPerPage}
                    setPagination={(value) => {
                        setRowsPerPage(value);
                        setCurrentPage(1); // Reset halaman saat ubah jumlah rows
                    }}
                    searchTerm={searchTerm}
                    handleSearchChange={handleSearchChange}
                />
                <Box display="flex" justifyContent="end" mb={2} flexWrap="wrap" gap={2}>
                    <Button
                        variant={showWithDeleted ? "contained" : "outlined"}
                        color="primary"
                        onClick={onToggleWithDeleted}
                        startIcon={<FaEye />}
                        sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            boxShadow: showWithDeleted ? 2 : 0,
                        }}
                    >
                        {showWithDeleted ? "Hide Deleted" : "Show All"}
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={onShowDeletedOnly}
                        startIcon={<DeleteIcon />}
                        sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                        }}
                    >
                        Show Deleted Only
                    </Button>
                </Box>
                {/* === Table === */}
                <TableContainer>
                    <Table aria-label="category table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="w-[20px]">No</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Metadata</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell>Last Updated</TableCell>
                                {showWithDeleted && <TableCell>Delete At</TableCell>}
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedCategories.map((category, index) => (
                                <TableRow key={category.id} hover>
                                    <TableCell component="th" scope="row">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{renderJsonFormat(category.metadata)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={category.isActive ? "Active" : "Inactive"}
                                            size="small"
                                            sx={{
                                                backgroundColor: category.isActive ? '#34d4c1' : '#9ca3af',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                px: 1.5, // padding horizontal
                                                py: 0.5, // padding vertical
                                                borderRadius: '8px',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{category.created_at_formatted}</TableCell>
                                    <TableCell>{category.created_at_formatted}</TableCell>
                                    {showWithDeleted && <TableCell>{category.deleted_at_formatted}</TableCell>}
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => onEdit(category)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(category)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCategories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No categories found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* === Custom Pagination === */}
                <Box className="w-full flex justify-end items-center py-4 gap-2">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </Box>
            </Box>

            {/* === Confirmation Dialog === */}
            <ConfirmationDialog
                open={deleteDialogOpen}
                title="Delete Category"
                content={`Are you sure you want to delete the category "${categoryToDelete?.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteDialogOpen(false)}
            />
        </>
    );
};
