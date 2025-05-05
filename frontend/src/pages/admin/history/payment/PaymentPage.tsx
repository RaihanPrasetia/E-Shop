import { useCallback, useEffect, useState } from "react";
import Content from "@/components/ui/content/Content";
import ContentBody from "@/components/ui/content/ContentBody";
import { ContentHead } from "@/components/ui/content/ContentHead";
import paymentService from "@/services/payment/paymentService";
import { useNotification } from "@/hooks/useNotification";
import { FormattedPaymentType } from "@/utils/types/PaymentType";
import { PaymentList } from "@/components/admin/payment/PaymentList";
import ExportPaymentButton from "@/components/admin/payment/ExportPaymentButton";

export default function PaymentPage() {
    const [payments, setPayments] = useState<FormattedPaymentType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        per_page: 5,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const { showNotification } = useNotification();

    const fetchPayments = useCallback(
        async (page = 1, per_page = pagination.per_page, search = searchTerm) => {
            try {
                setLoading(true);
                const response = await paymentService.getPayments({ page, per_page, search });
                setPayments(response.paymentsFormatted);
                setPagination({
                    current_page: response.pagination.current_page,
                    total: response.pagination.total,
                    per_page: response.pagination.per_page,
                });
            } catch (error) {
                showNotification(error instanceof Error ? error.message : "Gagal memuat pembayaran", "error");
            } finally {
                setLoading(false);
            }
        },
        [searchTerm, pagination.per_page]
    );

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleDeletePayment = async (id: string) => {
        try {
            await paymentService.deletePayment(id);
            showNotification("Pembayaran berhasil dihapus", "success");
            fetchPayments(pagination.current_page);
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Gagal menghapus pembayaran", "error");
        }
    };

    const handlePageChange = (page: number) => {
        fetchPayments(page);
    };

    const handleRowsPerPageChange = (value: number) => {
        setPagination((prev) => ({ ...prev, per_page: value }));
        fetchPayments(1, value);
    };


    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        fetchPayments(1, pagination.per_page, value);
    };

    return (
        <Content>
            <ContentHead title="List Payment" subTitle="Manage your payment here" >
                <ExportPaymentButton />
            </ContentHead>
            <ContentBody>
                <PaymentList
                    payments={payments}
                    loading={loading}
                    pagination={pagination}
                    searchTerm={searchTerm}
                    setSearchTerm={handleSearchChange}
                    rowsPerPage={pagination.per_page}
                    setRowsPerPage={handleRowsPerPageChange}
                    onPageChange={handlePageChange}
                    onDelete={handleDeletePayment}
                />
            </ContentBody>
        </Content>
    );
}

