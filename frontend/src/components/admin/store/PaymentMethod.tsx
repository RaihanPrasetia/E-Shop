import { useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Grid,
    Button,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    Collapse,
} from "@mui/material";
import { MoreVert as MoreVertIcon, ExpandMore, ExpandLess, Edit, Delete } from "@mui/icons-material";
import { ConfirmationDialog } from "../../ui/ConfirmationDialog";
import { FaSpinner } from "react-icons/fa";
import { FormattedPaymentMethodType } from "@/utils/types/PaymentMethodType";
import fromattedDate from "@/utils/formattedDate";
import { FormattedBankType } from "@/utils/types/BankTypes";
import bankService from "@/services/bank/bankService";
import { useNotification } from "@/hooks/useNotification";
import { BankDrawer } from "../drawer/BankDrawer";
import { BiPlus } from "react-icons/bi";

interface PaymentMethodListProps {
    paymentMethods: FormattedPaymentMethodType[];
    loading: boolean;
    onSuccessBank: () => void;
    onEdit: (paymentMethod: FormattedPaymentMethodType) => void;
    onDelete: (id: string) => void;
}

export const PaymentMethodContent = ({ paymentMethods, loading, onEdit, onDelete, onSuccessBank }: PaymentMethodListProps) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<FormattedPaymentMethodType | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuTargetId, setMenuTargetId] = useState<string | null>(null);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const [selectedBank, setSelectedBank] = useState<FormattedBankType | null>(null);
    const [editBankMode, setBankEditMode] = useState<boolean>(false);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [bankToDelete, setBankToDelete] = useState<FormattedBankType | null>(null);
    const [deleteBankDialogOpen, setDeleteBankDialogOpen] = useState<boolean>(false);
    const { showNotification } = useNotification(); // Use the notification hook

    const handleDeleteClick = (paymentMethod: FormattedPaymentMethodType) => {
        setPaymentMethodToDelete(paymentMethod);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (paymentMethodToDelete) {
            onDelete(paymentMethodToDelete.id);
            setDeleteDialogOpen(false);
            setPaymentMethodToDelete(null);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setAnchorEl(event.currentTarget);
        setMenuTargetId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuTargetId(null);
    };

    const toggleExpand = (id: string) => {
        setExpandedCardId((prevId) => (prevId === id ? null : id));
    };

    const handleOpenDrawer = (mode: "add" | "edit", bank?: FormattedBankType) => {
        if (mode === "edit" && bank) {
            setSelectedBank(bank);
            setBankEditMode(true);
        } else {
            setSelectedBank(null);
            setBankEditMode(false);
        }
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedBank(null);
    };

    const handleConfirmDeleteBank = async () => {
        if (!bankToDelete) return;
        try {
            const response = await bankService.deleteBank(bankToDelete.id);
            if (response.message) {
                showNotification("Bank berhasil dihapus", "success");
                onSuccessBank();
            } else {
                showNotification("Gagal menghapus bank", "error");
            }
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Gagal menghapus bank", "error");
        } finally {
            setDeleteBankDialogOpen(false);
            setBankToDelete(null);
        }
    };

    const handleOpenBankConfirm = (bank: FormattedBankType) => {
        setBankToDelete(bank);
        setDeleteBankDialogOpen(true);
    };

    if (loading) {
        return (
            <Box className="w-full h-[200px] flex flex-col justify-center items-center gap-4">
                <FaSpinner className="animate-spin text-primary text-3xl" />
                <Typography color="textSecondary">Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%" }}>
            <Grid container spacing={2}>
                {paymentMethods.map((pm) => (
                    <Grid size={12} key={pm.id}>
                        <Card variant="outlined">
                            <CardHeader
                                avatar={<Avatar>{pm.name.charAt(0)}</Avatar>}
                                action={
                                    <>
                                        <IconButton onClick={(e) => handleMenuOpen(e, pm.id)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={menuTargetId === pm.id}
                                            onClose={handleMenuClose}
                                        >
                                            <MenuItem onClick={() => { onEdit(pm); handleMenuClose(); }}>
                                                <Edit fontSize="small" sx={{ mr: 1 }} />
                                                Edit
                                            </MenuItem>
                                            <MenuItem onClick={() => { handleDeleteClick(pm); handleMenuClose(); }}>
                                                <Delete fontSize="small" sx={{ mr: 1 }} color="error" />
                                                Delete
                                            </MenuItem>
                                        </Menu>
                                    </>
                                }
                                title={
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography
                                            variant="h6"
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => toggleExpand(pm.id)}
                                        >
                                            {pm.name}
                                        </Typography>
                                        <IconButton onClick={() => toggleExpand(pm.id)}>
                                            {expandedCardId === pm.id ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </Box>
                                }
                                subheader={pm.description}
                            />
                            <Collapse in={expandedCardId === pm.id} timeout="auto" unmountOnExit>
                                <CardContent>
                                    <Grid container justifyContent="space-between" alignItems="center">
                                        <Grid size={6}>
                                            <Typography variant="subtitle2">Bank Accounts:</Typography>
                                        </Grid>
                                        <Grid>
                                            <Button
                                                className="bg-utama"
                                                variant="contained"
                                                startIcon={<BiPlus />}
                                                onClick={() => handleOpenDrawer("add")}
                                            >
                                                Add Bank
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    {pm.banks.length === 0 && (
                                        <Typography variant="body2" color="textSecondary">
                                            No banks added
                                        </Typography>
                                    )}
                                    {pm.banks.map((bank) => (
                                        <Paper key={bank.id} sx={{ p: 1, my: 1 }} variant="outlined">
                                            <Grid container justifyContent="space-between" alignItems="center">
                                                <Grid size={4}>
                                                    <Typography variant="body1">{bank.name}</Typography>
                                                    <Typography variant="body2" color="textSecondary">{bank.no_rek}</Typography>
                                                    <Typography variant="body2" color="textSecondary">An : {bank.an}</Typography>
                                                </Grid>
                                                <Grid size={4}>
                                                    <Typography variant="body1">
                                                        <Box display="flex" alignItems="center">
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    width: 10,
                                                                    height: 10,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: bank.isActive ? 'green' : 'red',
                                                                    display: 'inline-block',
                                                                    marginRight: 1,
                                                                }}
                                                            />
                                                            {bank.isActive ? 'Aktif' : 'Tidak Aktif'}
                                                        </Box>
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {fromattedDate(new Date(bank.created_at))}
                                                    </Typography>
                                                </Grid>
                                                <Grid size={4} display="flex" justifyContent="flex-end" gap={1}>
                                                    <Button size="small" variant="outlined" onClick={() => handleOpenDrawer("edit", bank)}>Edit</Button>
                                                    <Button size="small" variant="outlined" color="error" onClick={() => handleOpenBankConfirm(bank)}>Delete</Button>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                </CardContent>
                            </Collapse>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <BankDrawer
                methods={paymentMethods}
                bank={selectedBank}
                editMode={editBankMode}
                onClose={handleCloseDrawer}
                onSuccess={() => {
                    handleCloseDrawer();
                    onSuccessBank()
                }}
                open={drawerOpen}
            />
            <ConfirmationDialog
                open={deleteDialogOpen}
                title="Delete Payment Method"
                content={`Are you sure you want to delete the payment method "${paymentMethodToDelete?.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteDialogOpen(false)}
            />

            <ConfirmationDialog
                open={deleteBankDialogOpen}
                title="Hapus Bank"
                content={`Apakah Anda yakin ingin menghapus bank "${bankToDelete?.name}"?`}
                onConfirm={handleConfirmDeleteBank}
                onCancel={() => setDeleteBankDialogOpen(false)}
            />

        </Box>
    );
};
