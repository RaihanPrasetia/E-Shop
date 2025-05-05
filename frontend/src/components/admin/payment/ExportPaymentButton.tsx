import { useState } from 'react';
import axios from 'axios';

const ExportPaymentButton = ({ filters = {} }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const exportToExcel = async () => {
        setLoading(true);
        setError('');

        try {
            // Set up the request with proper response type for file downloads
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/export/payments`, {
                params: filters,
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Accept': 'application/json'
                }
            });

            // Check if we received a blob (successful file) or JSON (error message)
            const contentType = response.headers['content-type'];

            if (contentType && contentType.includes('application/json')) {
                // This is an error response from the server
                const reader = new FileReader();
                reader.onload = () => {
                    const errorData = JSON.parse(reader.result as string);
                    setError(errorData.error || 'An error occurred during export');
                    console.error('Export error:', errorData);
                };
                reader.readAsText(response.data);
            } else {
                // This is a successful file download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (err) {
            console.error('Error exporting products:', err);

            // Handle axios errors
            if (axios.isAxiosError(err)) {
                // Try to extract error message from response
                if (err.response?.data instanceof Blob) {
                    try {
                        const reader = new FileReader();
                        reader.onload = () => {
                            try {
                                const errorData = JSON.parse(reader.result as string);
                                setError(errorData.error || 'Server error during export');
                            } catch (e) {
                                setError(`Export failed with status ${err.response?.status}`);
                            }
                        };
                        reader.readAsText(err.response.data);
                    } catch (e) {
                        setError(`Export failed with status ${err.response?.status}`);
                    }
                } else {
                    setError(err.message || 'Failed to export data');
                }
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                className='px-3 py-1 bg-blue-500 text-white font-semibold text-md rounded-md'
                onClick={exportToExcel}
                disabled={loading}
            >
                {loading ? 'Exporting...' : 'Export to Excel'}
            </button>

            {error && (
                <div className="text-red-500 mt-2">
                    {error}
                </div>
            )}
        </>
    );
};

export default ExportPaymentButton;