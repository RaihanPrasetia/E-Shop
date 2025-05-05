import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Stack,
    CircularProgress,
    Button,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import paymentService from "@/services/payment/paymentService";
import { useNotification } from "@/hooks/useNotification";
import { FormattedPaymentType } from "@/utils/types/PaymentType";
import { getStatusBadge } from "@/utils/helpers/BudgeStatus";
import { formatToRupiah } from "@/utils/priceFormated";

export const PaymentDetail = () => {
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get("paymentId");
    const { showNotification } = useNotification();

    const [payment, setPayment] = useState<FormattedPaymentType | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (paymentId) {
            const fetchDetail = async () => {
                try {
                    const response = await paymentService.getPaymentById(paymentId);
                    setPayment(response.paymentFormatted);
                } catch (err) {
                    showNotification("Gagal memuat detail pembayaran", "error");
                } finally {
                    setLoading(false);
                }
            };

            fetchDetail();
        }
    }, [paymentId]);

    if (loading) return <CircularProgress />;
    if (!payment) return <Typography>Data tidak ditemukan.</Typography>;

    const { order, bank } = payment;

    const handleDownloadProof = () => {
        if (payment.proof) {
            const proofUrl = `${import.meta.env.VITE_API_URL}/storage/${payment.proof}`;
            const a = document.createElement("a");
            a.href = proofUrl;
            a.download = `bukti_pembayaran_${payment.id}.jpg`; // Anda dapat mengganti ekstensi sesuai dengan tipe file
            a.click();
        }
    };

    return (
        <Stack spacing={3}>
            {/* Payment Info */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Payment Info
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                <Typography>ID: {payment.id}</Typography>
                                <Typography>
                                    Amount: Rp {parseFloat(payment.amount).toLocaleString()}
                                </Typography>
                                <Typography className="gap-5 space-x-4 flex items-center justify-start">
                                    <span>Status :</span>  {getStatusBadge(payment.status)}
                                </Typography>
                                <Typography>Date: {payment.created_at_formatted}</Typography>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight={500} gutterBottom>
                                Bukti Pembayaran:
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleDownloadProof}
                                    disabled={!payment.proof}
                                >
                                    Download
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    href={`${import.meta.env.VITE_API_URL}/storage/${payment.proof}`}
                                    target="_blank"
                                    disabled={!payment.proof}
                                >
                                    Lihat
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Bank Info, Order Info, Order Items */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }} gap={2} display={"flex"} flexDirection={"column"}>
                    {/* Bank Info */}
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Bank Info
                            </Typography>
                            <Stack spacing={1}>
                                <Typography>Name: {bank.name}</Typography>
                                <Typography>No Rek: {bank.no_rek}</Typography>
                                <Typography>AN: {bank.an}</Typography>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Order Info */}
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Order Info
                            </Typography>
                            <Stack spacing={1}>
                                <Typography>Order ID: {order.id}</Typography>
                                <Typography>
                                    Total Price: Rp {parseFloat(order.total_price).toLocaleString()}
                                </Typography>
                                <Typography>Total Qty: {order.total_qty}</Typography>
                                <Typography>Status: {order.status}</Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    {/* Order Items */}
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Order Items
                            </Typography>
                            <Stack spacing={2}>
                                {order.order_items.map((item: any, idx: number) => (
                                    <Box
                                        key={item.id}
                                        sx={{
                                            p: 2,
                                            bgcolor: "#f9f9f9",
                                            borderRadius: 2,
                                            boxShadow: 0.5,
                                        }}
                                    >
                                        <Typography fontWeight={500}>
                                            {idx + 1}. {item.product_name}
                                        </Typography>
                                        <Typography>
                                            Price: {formatToRupiah(item.price)}
                                        </Typography>
                                        <Typography>Qty: {item.qty}</Typography>
                                        <Typography>Total: {formatToRupiah(item.qty * parseInt(item.price))}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Stack>
    );
};
