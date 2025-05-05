import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { FaEye, FaSpinner } from "react-icons/fa";
import { FormattedPaymentType } from "@/utils/types/PaymentType";
import { ConfirmationDialog } from "../../ui/ConfirmationDialog";
import Pagination from "../../ui/Pagination";
import CustomeFilter from "../../ui/CustomeFilter";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PaymentListProps {
    payments: FormattedPaymentType[];
    loading: boolean;
    pagination: {
        current_page: number;
        total: number;
        per_page: number;
    };
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    rowsPerPage: number;
    setRowsPerPage: (rows: number) => void;
    onPageChange: (page: number) => void;
    onDelete: (id: string) => void;
    onEdit?: (payment: FormattedPaymentType) => void;
}

export const PaymentList = ({
    payments,
    loading,
    pagination,
    searchTerm,
    setSearchTerm,
    rowsPerPage,
    setRowsPerPage,
    onPageChange,
    onDelete,
}: PaymentListProps) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<FormattedPaymentType | null>(null);
    const navigate = useNavigate()

    const handleDeleteClick = (payment: FormattedPaymentType) => {
        setPaymentToDelete(payment);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (paymentToDelete) {
            onDelete(paymentToDelete.id);
            setDeleteDialogOpen(false);
            setPaymentToDelete(null);
        }
    };

    if (loading) {
        return (
            <Box className="w-full h-[200px] flex flex-col justify-center items-center gap-4">
                <FaSpinner className="animate-spin text-primary text-3xl" />
                <p className="text-gray-600 text-lg">Loading...</p>
            </Box>
        );
    }

    const handleToDetail = (id: string) => {
        navigate(`/admin/history/payment/detail?paymentId=${id}`)
    }

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <CustomeFilter
                    pagination={rowsPerPage}
                    setPagination={(value) => setRowsPerPage(value)}
                    searchTerm={searchTerm}
                    handleSearchChange={(e) => setSearchTerm(e.target.value)}
                />

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>No</TableCell>
                                <TableCell>Tanggal</TableCell>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Jumlah Item</TableCell>
                                <TableCell>Bank</TableCell>
                                <TableCell>Jumlah</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.length > 0 ? (
                                payments.map((payment, index) => (
                                    <TableRow key={payment.id} hover>
                                        <TableCell>
                                            {(pagination.current_page - 1) * pagination.per_page + index + 1}
                                        </TableCell>
                                        <TableCell>{payment.payment_date}</TableCell>
                                        <TableCell>{payment.order?.id}</TableCell>
                                        <TableCell>{payment.order?.total_qty}</TableCell>
                                        <TableCell>{payment.bank?.name}</TableCell>
                                        <TableCell>Rp {payment.amount}</TableCell>
                                        <TableCell>{payment.status}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Lihat">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleToDetail(payment.id)}
                                                >
                                                    <FaEye />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(payment)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        No payments found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box className="w-full flex justify-end items-center py-4 gap-2">
                    <Pagination
                        currentPage={pagination.current_page}
                        totalPages={Math.ceil(pagination.total / pagination.per_page)}
                        onPageChange={onPageChange}
                    />
                </Box>
            </Box>

            <ConfirmationDialog
                open={deleteDialogOpen}
                title="Delete Payment"
                content={`Are you sure you want to delete the payment on ${paymentToDelete?.payment_date}?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteDialogOpen(false)}
            />
        </>
    );
};
