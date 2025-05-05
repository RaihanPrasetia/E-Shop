import AuditList from "@/components/admin/audit/AuditList";
import Content from "@/components/ui/content/Content";
import ContentBody from "@/components/ui/content/ContentBody";
import { ContentHead } from "@/components/ui/content/ContentHead";
import { useNotification } from "@/hooks/useNotification";
import auditService from "@/services/audit/auditService";
import { FormattedAuditType } from "@/utils/types/AuditType";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

export default function AuditPage() {
    const [audits, setAudits] = useState<FormattedAuditType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { showNotification } = useNotification();
    const [selectedModel, setSelectedModel] = useState<string>("");

    const fetchAudits = useCallback(async () => {
        try {
            setLoading(true);
            const response = await auditService.getAudits(selectedModel || undefined);
            setAudits(response.auditsFormatted);
        } catch (error) {
            showNotification("Gagal memuat audit", "error");
        } finally {
            setLoading(false);
        }
    }, [selectedModel]);// Kosongkan dependency array

    useEffect(() => {
        fetchAudits();
    }, [fetchAudits]);



    return (
        <Content>
            <ContentHead title="History Audits " subTitle="Cek the history">
                <FormControl fullWidth sx={{ mb: 3, minWidth: 150 }}>
                    <InputLabel>Filter Model</InputLabel>
                    <Select
                        value={selectedModel}
                        label="Filter Model"
                        onChange={(e) => setSelectedModel(e.target.value)}
                    >
                        <MenuItem value="">Semua</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="product">Product</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                        <MenuItem value="payment">Payment</MenuItem>
                        <MenuItem value="cart">Cart</MenuItem>
                        <MenuItem value="order">Order</MenuItem>
                        <MenuItem value="variant">Variant</MenuItem>
                        {/* Tambahkan jika ada model lain */}
                    </Select>
                </FormControl>
            </ContentHead>
            <ContentBody>
                <AuditList
                    audits={audits}
                    loading={loading}
                />
            </ContentBody>

        </Content>
    );
}
