<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Str;

class ExcelController extends Controller
{

    public function exportPayments(Request $request)
    {
        try {
            // Validasi input
            $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'status' => 'nullable|string',
            ]);

            // Ambil data dengan relasi
            $query = Payment::with(['order.orderItems', 'bank'])
                ->orderBy('payment_date', 'desc');

            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('payment_date', [
                    $request->start_date . ' 00:00:00',
                    $request->end_date . ' 23:59:59'
                ]);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $payments = $query->get();

            // Buat spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Header
            $headers = [
                'Payment ID',
                'Order ID',
                'Bank',
                'Account Number',
                'Account Name',
                'Amount',
                'Status',
                'Payment Date',
                'Created At',
                'Product Name',
                'Qty'
            ];

            $columnLetter = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($columnLetter . '1', $header);
                $columnLetter++;
            }
            $sheet->getStyle('A1:K1')->getFont()->setBold(true);

            // Isi data per baris (per item order)
            $row = 2;
            foreach ($payments as $payment) {
                $order = $payment->order;
                $items = $order?->orderItems ?? collect([null]);

                foreach ($items as $item) {
                    $sheet->setCellValue('A' . $row, $payment->id);
                    $sheet->setCellValue('B' . $row, $payment->order_id);
                    $sheet->setCellValue('C' . $row, $payment->bank->name ?? $payment->bank_name ?? '');
                    $sheet->setCellValue('D' . $row, $payment->bank_no_rek);
                    $sheet->setCellValue('E' . $row, $payment->bank_an);
                    $sheet->setCellValue('F' . $row, $payment->amount);
                    $sheet->setCellValue('G' . $row, $payment->status);
                    $sheet->setCellValue('H' . $row, $payment->payment_date);
                    $sheet->setCellValue('I' . $row, $payment->created_at);
                    $sheet->setCellValue('J' . $row, $item->product_name ?? '-');
                    $sheet->setCellValue('K' . $row, $item->qty ?? '-');
                    $row++;
                }
            }

            // Auto ukuran kolom
            foreach (range('A', 'K') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            // Simpan sementara
            $fileName = 'payments_export_' . date('Ymd_His') . '.xlsx';
            $exportPath = storage_path('app/exports');
            if (!file_exists($exportPath)) {
                mkdir($exportPath, 0755, true);
            }

            $filePath = $exportPath . '/' . $fileName;
            $writer = new Xlsx($spreadsheet);
            $writer->save($filePath);

            // Kirim file download
            return response()->download($filePath, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    public function importPayments(Request $request)
    {
        try {
            // Validasi file upload
            $request->validate([
                'file' => 'required|file|mimes:xlsx,xls'
            ]);

            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, true); // ambil semua data

            $header = $rows[1]; // baris pertama sebagai header
            unset($rows[1]); // hapus header

            $imported = 0;
            foreach ($rows as $row) {
                // Mapping kolom
                $orderId = $row['A'] ?? null;
                $bankName = $row['B'] ?? null;
                $bankNoRek = $row['C'] ?? null;
                $bankAn = $row['D'] ?? null;
                $amount = $row['E'] ?? null;
                $status = $row['F'] ?? null;
                $paymentDate = $row['G'] ?? null;

                // Validasi data minimal (boleh disesuaikan)
                if (!$orderId || !$amount || !$paymentDate) {
                    continue;
                }

                // Simpan ke database
                Payment::create([
                    'order_id' => $orderId,
                    'amount' => $amount,
                    'status' => $status ?? 'pending',
                    'payment_date' => $paymentDate,
                    'bank_name' => $bankName,
                    'bank_no_rek' => $bankNoRek,
                    'bank_an' => $bankAn,
                ]);

                $imported++;
            }

            return response()->json([
                'message' => "Import berhasil. Total baris berhasil diimpor: $imported"
            ]);
        } catch (\Exception $e) {
            Log::error('Import error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Import gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function importProduct(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls'
        ]);

        $spreadsheet = IOFactory::load($request->file('file')->getPathname());

        DB::beginTransaction();
        try {
            $productSheet = $spreadsheet->getSheetByName('Products');
            $rows = $productSheet->toArray(null, true, true, true);

            $headers = array_shift($rows); // ambil header
            foreach ($rows as $row) {
                $data = array_combine(array_values($headers), array_values($row));

                $categoryName = trim($data['category_name']);
                $categoryIsActive = isset($data['category_isActive']) ? (bool)$data['category_isActive'] : true;

                // Decode category_metadata, pastikan format JSON
                $categoryMetadata = json_decode($data['category_metadata'], true);

                // Encode kembali ke string JSON dengan escape karakter
                $categoryMetadataJson = json_encode($categoryMetadata, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT);

                // Buat atau cari kategori
                $category = Category::firstOrCreate(
                    ['name' => $categoryName],
                    [
                        'id' => (string) Str::uuid(),
                        'isActive' => $categoryIsActive,
                        'metadata' => $categoryMetadataJson, // Simpan dalam format string JSON yang di-escape
                        'created_by' => Auth::user()->id,
                    ]
                );

                // Decode specifications (JSON) jika ada
                $specifications = json_decode($data['specifications (JSON)'], true) ?? [];

                // Encode specifications ke string JSON yang ter-escape
                $specificationsJson = json_encode($specifications, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT);

                // Simpan produk
                Product::create([
                    'id' => (string) Str::uuid(),
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'price' => $data['price'],
                    'stock' => $data['stock'],
                    'is_featured' => (bool) $data['is_featured'],
                    'is_published' => (bool) $data['is_published'],
                    'specifications' => $specificationsJson, // Simpan dalam format string JSON yang di-escape
                    'category_id' => $category->id,
                ]);
            }

            $this->importVariant($request, $spreadsheet);

            DB::commit();
            return response()->json(['message' => 'Import produk berhasil']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Import Product Error: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal import produk: ' . $e->getMessage()], 500);
        }
    }





    private function importVariant(Request $request, $spreadsheet)
    {
        $variantSheet = $spreadsheet->getSheetByName('Variants');
        $variantRows = $variantSheet->toArray(null, true, true, true);
        unset($variantRows[1]); // header

        foreach ($variantRows as $row) {
            $productName = $row['A'];
            $variantName = $row['B'];
            $options = json_decode($row['C'], true);

            $product = Product::where('name', $productName)->first();
            if (!$product) continue;

            ProductVariant::create([
                'id' => (string) Str::uuid(),
                'product_id' => $product->id,
                'name' => $variantName,
                'options' => is_array($options) ? $options : [],
            ]);
        }
    }
}
