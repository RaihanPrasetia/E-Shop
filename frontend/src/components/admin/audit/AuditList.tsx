import CustomeFilter from '@/components/ui/CustomeFilter';
import Pagination from '@/components/ui/Pagination';
import { FormattedAuditType } from '@/utils/types/AuditType';
import { Box, Chip, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { AiOutlineEdit, AiOutlinePlus, AiOutlineDelete } from 'react-icons/ai';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';


interface AuditListProps {
    audits: FormattedAuditType[];
    loading: boolean;
}

function AuditList({ audits, loading }: AuditListProps) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>(""); // created, updated, deleted
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page after search
    };

    // Filter audits by user name or if no user, try to filter by event type and auditable_type
    const filteredAudits = audits.filter((audit) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = audit.user?.name?.toLowerCase().includes(searchLower) ||
            audit.event.toLowerCase().includes(searchLower) ||
            audit.auditable_type.toLowerCase().includes(searchLower);

        const matchesStatus = selectedStatus ? audit.event === selectedStatus : true;

        const auditDate = new Date(audit.created_at);
        const matchesStartDate = startDate ? auditDate >= startDate : true;
        const matchesEndDate = endDate ? auditDate <= endDate : true;

        return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
    });

    const totalPages = Math.ceil(filteredAudits.length / rowsPerPage);

    const paginatedAudits = filteredAudits.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Helper function to get a user-friendly entity type display
    const getEntityType = (fullType: string): string => {
        // Extract just the model name without the namespace
        const parts = fullType.split('\\');
        return parts[parts.length - 1];
    };

    // Function to determine chip color and icon based on event type
    const getEventChipProps = (event: string) => {
        switch (event) {
            case 'created':
                return {
                    color: 'success' as const,
                    icon: <AiOutlinePlus />,
                    label: 'Created'
                };
            case 'updated':
                return {
                    color: 'primary' as const,
                    icon: <AiOutlineEdit />,
                    label: 'Updated'
                };
            case 'deleted':
                return {
                    color: 'error' as const,
                    icon: <AiOutlineDelete />,
                    label: 'Deleted'
                };
            case 'restored':
                return {
                    color: 'warning' as const,
                    icon: <AiOutlineDelete />,
                    label: 'Restore'
                };
            default:
                return {
                    color: 'default' as const,
                    icon: null,
                    label: event
                };
        }
    };
    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        setSelectedStatus(event.target.value);
        setCurrentPage(1);
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
                        setCurrentPage(1); // Reset page when changing rows per page
                    }}
                    searchTerm={searchTerm}
                    handleSearchChange={handleSearchChange}
                />
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={selectedStatus}
                            label="Status"
                            onChange={handleStatusChange}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="created">Created</MenuItem>
                            <MenuItem value="updated">Updated</MenuItem>
                            <MenuItem value="deleted">Deleted</MenuItem>
                        </Select>
                    </FormControl>
                    <Box display="flex" justifyContent="end" alignItems="center" gap={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Start Date"
                                value={startDate ? dayjs(startDate) : null}
                                onChange={(newValue) => {
                                    setStartDate(newValue ? newValue.toDate() : null);
                                    setCurrentPage(1);
                                }}
                            />
                            <DatePicker
                                label="End Date"
                                value={endDate ? dayjs(endDate) : null}
                                onChange={(newValue) => {
                                    setEndDate(newValue ? newValue.toDate() : null);
                                    setCurrentPage(1);
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                </Box>


                {/* === Table === */}
                <TableContainer>
                    <Table aria-label="audit table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="w-[20px]">No</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Note</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedAudits.map((audit, index) => {
                                const chipProps = getEventChipProps(audit.event);
                                return (
                                    <TableRow key={audit.id} hover>
                                        <TableCell component="th" scope="row">
                                            {(currentPage - 1) * rowsPerPage + index + 1}
                                        </TableCell>
                                        <TableCell>{audit.created_at_formatted}</TableCell>
                                        <TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={chipProps.label}
                                                    color={chipProps.color}
                                                    size="small"
                                                    {...(chipProps.icon ? { icon: chipProps.icon } : {})}
                                                />
                                            </TableCell>
                                        </TableCell>
                                        <TableCell>{audit.user?.name || 'System'}</TableCell>
                                        <TableCell>
                                            {chipProps.label} {getEntityType(audit.auditable_type)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredAudits.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No audits found
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
        </>
    );
}

export default AuditList;