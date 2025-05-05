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
    Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { FormattedProductType } from "@/utils/types/ProductType";
import { ConfirmationDialog } from "../../ui/ConfirmationDialog";
import { FaSpinner } from "react-icons/fa";
import Pagination from "../../ui/Pagination";
import CustomeFilter from "../../ui/CustomeFilter";
import { formatToRupiah } from "@/utils/priceFormated";
import { useNavigate } from "react-router-dom";

interface ProductListProps {
    products: FormattedProductType[];
    loading: boolean;
    onEdit: (product: FormattedProductType) => void;
    onDelete: (id: string) => void;
}

export const ProductList = ({ products, loading, onEdit, onDelete }: ProductListProps) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<FormattedProductType | null>(null);
    const navigate = useNavigate()

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset ke halaman pertama setelah search
    };

    const handleDeleteClick = (product: FormattedProductType) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (productToDelete) {
            onDelete(productToDelete.id);
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    // Filter kategori berdasarkan searchTerm
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Helper function to display specifications in a cleaner format with bold keys
    const handleToDetail = (id: string) => {
        navigate(`/admin/product/detail?productId=${id}`);
    }


    if (loading) {
        return (
            <Box className="w-full h-[200px] flex flex-col justify-center items-center gap-4">
                <FaSpinner className="animate-spin text-purple-600 text-3xl" />
                <p className="text-utama text-lg">Loading...</p>
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


                {/* === Table === */}
                <TableContainer>
                    <Table aria-label="product table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="w-[20px]">No</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedProducts.map((product, index) => (
                                <TableRow key={product.id} hover>
                                    <TableCell component="th" scope="row">
                                        {(currentPage - 1) * rowsPerPage + index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-utama-hover hover:cursor-pointer" onClick={() => handleToDetail(product.id)}>
                                            {product.name}
                                        </span>
                                    </TableCell>
                                    <TableCell width={"100px"}>
                                        <Stack spacing={1}>
                                            {/* Published status */}
                                            <Chip
                                                label={product.is_published ? "Published" : "Not Published"}
                                                size="small"
                                                sx={{
                                                    backgroundColor: product.is_published ? '#34d4c1' : '#9ca3af',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            {/* Featured status */}
                                            <Chip
                                                label={product.is_featured ? "Featured" : "Not Featured"}
                                                size="small"
                                                sx={{
                                                    backgroundColor: product.is_featured ? '#f59e0b' : '#9ca3af', // Color for featured vs not featured
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    px: 1.5, // padding horizontal
                                                    py: 0.5, // padding vertical
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {formatToRupiah(product.price)}
                                    </TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>{product.category.name}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => onEdit(product)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(product)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        No products found
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
                title="Delete Product"
                content={`Are you sure you want to delete the product "${productToDelete?.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteDialogOpen(false)}
            />
        </>
    );
};