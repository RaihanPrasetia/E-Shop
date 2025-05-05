import { useCallback, useEffect, useState } from "react";
import { Box, Button, CssBaseline, Typography } from "@mui/material";
import { FaStore } from "react-icons/fa"; // React icons for Store
import { BiPlus, BiSolidBank } from "react-icons/bi"; // React icon for Bank
import StoreContent from "@/components/admin/store/StoreContent";
import { useNotification } from "@/hooks/useNotification";
import { FormattedPaymentMethodType } from "@/utils/types/PaymentMethodType";
import paymentMethodService from "@/services/paymentMethod/paymentMethod";
import { PaymentMethodContent } from "@/components/admin/store/PaymentMethod";
import PaymentMethodDrawer from "@/components/admin/drawer/PaymentMethodDrawer";

export default function StorePage() {
    const [selectedMenu, setSelectedMenu] = useState<string>("Store");
    const [paymentMethods, setPaymentMethods] = useState<FormattedPaymentMethodType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<FormattedPaymentMethodType | null>(null);
    const { showNotification } = useNotification(); // Use the notification hook

    const menuItems = [
        { name: "Store", icon: <FaStore style={{ marginRight: 8 }} /> },
        { name: "Payment Method", icon: <BiSolidBank style={{ marginRight: 8 }} /> },
    ];

    const fetchPaymentMethods = useCallback(async () => {
        try {
            setLoading(true);
            const response = await paymentMethodService.getPaymentMethods();
            setPaymentMethods(response.paymentMethodsFormatted);
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
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    const handleMenuClick = (menu: string) => {
        setSelectedMenu(menu);
    };

    const handleOpenDrawer = (mode: "add" | "edit", paymentMethod?: FormattedPaymentMethodType) => {
        if (mode === "edit" && paymentMethod) {
            setSelectedPaymentMethod(paymentMethod);
            setEditMode(true);
        } else {
            setSelectedPaymentMethod(null);
            setEditMode(false);
        }
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedPaymentMethod(null);
    };

    const handleDeletePaymentMethod = async (id: string) => {
        try {
            await paymentMethodService.deletePaymentMethod(id);
            showNotification("Method berhasil dihapus", "success");
            fetchPaymentMethods();
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Failed to delete Method", "error");
        }
    };

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            {/* Sidebar using Box and flex */}
            <Box
                sx={{
                    position: "sticky", // Sticky position
                    top: 80, // Jarak dari atas viewport (ubah sesuai kebutuhan header)
                    width: 240,
                    display: "flex",
                    flexDirection: "column",
                    paddingRight: 2,
                    gap: 2,
                    minHeight: '100%'
                }}
            >
                {menuItems.map((item) => (
                    <Button
                        key={item.name}
                        onClick={() => handleMenuClick(item.name)}
                        className={`rounded-md ${selectedMenu === item.name ? "bg-utama" : "transparent"}`}
                        sx={{
                            display: "flex",
                            justifyContent: "flex-start",
                            width: "100%",
                            padding: 2,
                            color: selectedMenu === item.name ? "white" : "text.primary",
                            "&:hover": {
                                backgroundColor: selectedMenu === item.name ? "primary.dark" : "transparent",
                            },
                        }}
                    >
                        {item.icon}
                        {item.name}
                    </Button>
                ))}
            </Box>


            {/* Main content area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: "background.default",
                    padding: 3,
                }}
            >
                <Box display={"flex"} marginBottom={2} justifyContent={'space-between'} alignItems={'center'}>
                    <Typography>{selectedMenu}</Typography>
                    {selectedMenu == 'Payment Method' && (
                        <div className="flex space-x-2 justify-end item">
                            <Button
                                className="bg-utama"
                                variant="contained"
                                startIcon={<BiPlus />}
                                onClick={() => handleOpenDrawer("add")}
                            >
                                Add Method
                            </Button>
                        </div>
                    )}
                </Box>

                <Box>
                    {selectedMenu === "Store"
                        ?
                        <StoreContent />
                        : <PaymentMethodContent
                            loading={loading}
                            onDelete={handleDeletePaymentMethod}
                            onEdit={(paymentMethod) => handleOpenDrawer("edit", paymentMethod)}
                            paymentMethods={paymentMethods} onSuccessBank={() => {
                                fetchPaymentMethods()
                            }} />}
                </Box>

                <PaymentMethodDrawer
                    open={drawerOpen}
                    onClose={handleCloseDrawer}
                    editMode={editMode}
                    paymentMethod={selectedPaymentMethod}
                    onSuccess={() => {
                        handleCloseDrawer();
                        fetchPaymentMethods();
                    }}
                />
            </Box>
        </Box>
    );
}
