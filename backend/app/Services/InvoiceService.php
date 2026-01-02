<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Vendor;
use Carbon\Carbon;

class InvoiceService
{
    /**
     * Get list of invoices with pagination
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getInvoices(array $filters = []): array
    {
        $query = Invoice::with('vendor');

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('vendor', function ($vendorQuery) use ($search) {
                      $vendorQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['vendor_id'])) {
            $query->where('vendor_id', $filters['vendor_id']);
        }

        // Update overdue status before fetching
        $this->updateOverdueInvoices();

        $perPage = $filters['per_page'] ?? 15;
        $invoices = $query->orderBy('invoice_date', 'desc')->paginate($perPage);

        return [
            'invoices' => $invoices->items(),
            'pagination' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
        ];
    }

    /**
     * Get a single invoice
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getInvoice(int $id): array
    {
        $invoice = Invoice::with('vendor')->find($id);

        if (!$invoice) {
            return [
                'success' => false,
                'message' => 'Invoice not found',
            ];
        }

        // Update overdue status if needed
        $this->updateOverdueStatus($invoice);

        return [
            'success' => true,
            'invoice' => $this->formatInvoice($invoice),
        ];
    }

    /**
     * Create a new invoice
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createInvoice(array $data): array
    {
        try {
            // Calculate status based on due date
            $status = $this->calculateStatus($data['due_date']);

            $invoice = Invoice::create([
                'invoice_number' => $data['invoice_number'],
                'vendor_id' => $data['vendor_id'],
                'description' => $data['description'],
                'invoice_date' => $data['invoice_date'],
                'due_date' => $data['due_date'],
                'amount' => $data['amount'],
                'category' => $data['category'],
                'status' => $status,
            ]);

            $invoice->load('vendor');

            // Update vendor totals
            $this->updateVendorTotals($invoice->vendor_id);

            return [
                'success' => true,
                'invoice' => $this->formatInvoice($invoice),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create invoice: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update an invoice
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateInvoice(int $id, array $data): array
    {
        $invoice = Invoice::find($id);

        if (!$invoice) {
            return [
                'success' => false,
                'message' => 'Invoice not found',
                'status' => 404,
            ];
        }

        try {
            // Recalculate status if due_date is being updated
            if (isset($data['due_date'])) {
                $data['status'] = $this->calculateStatus($data['due_date'], $invoice->status);
            }

            $oldVendorId = $invoice->vendor_id;
            $invoice->update($data);
            $invoice->load('vendor');

            // Update vendor totals for old and new vendor (if changed)
            $this->updateVendorTotals($oldVendorId);
            if (isset($data['vendor_id']) && $data['vendor_id'] != $oldVendorId) {
                $this->updateVendorTotals($data['vendor_id']);
            }

            return [
                'success' => true,
                'invoice' => $this->formatInvoice($invoice->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update invoice: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete an invoice
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteInvoice(int $id): array
    {
        $invoice = Invoice::find($id);

        if (!$invoice) {
            return [
                'success' => false,
                'message' => 'Invoice not found',
                'status' => 404,
            ];
        }

        try {
            $vendorId = $invoice->vendor_id;
            $invoice->delete();

            // Update vendor totals
            $this->updateVendorTotals($vendorId);

            return [
                'success' => true,
                'message' => 'Invoice deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete invoice: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Approve an invoice
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function approveInvoice(int $id): array
    {
        $invoice = Invoice::find($id);

        if (!$invoice) {
            return [
                'success' => false,
                'message' => 'Invoice not found',
                'status' => 404,
            ];
        }

        if ($invoice->status === 'Paid') {
            return [
                'success' => false,
                'message' => 'Cannot approve a paid invoice',
            ];
        }

        try {
            $invoice->update(['status' => 'Approved']);
            $invoice->load('vendor');

            // Update vendor totals
            $this->updateVendorTotals($invoice->vendor_id);

            return [
                'success' => true,
                'invoice' => $this->formatInvoice($invoice->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to approve invoice: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Mark invoice as paid
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function payInvoice(int $id): array
    {
        $invoice = Invoice::find($id);

        if (!$invoice) {
            return [
                'success' => false,
                'message' => 'Invoice not found',
                'status' => 404,
            ];
        }

        try {
            $invoice->update(['status' => 'Paid']);
            $invoice->load('vendor');

            // Update vendor totals
            $this->updateVendorTotals($invoice->vendor_id);

            return [
                'success' => true,
                'invoice' => $this->formatInvoice($invoice->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to pay invoice: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Calculate invoice status based on due date
     *
     * @param string $dueDate
     * @param string|null $currentStatus
     * @return string
     */
    private function calculateStatus(string $dueDate, ?string $currentStatus = null): string
    {
        // Don't change status if already Paid
        if ($currentStatus === 'Paid') {
            return 'Paid';
        }

        $today = Carbon::today();
        $due = Carbon::parse($dueDate);

        if ($due->lt($today)) {
            return 'Overdue';
        }

        return $currentStatus ?? 'Pending';
    }

    /**
     * Update overdue status for a single invoice
     *
     * @param Invoice $invoice
     * @return void
     */
    private function updateOverdueStatus(Invoice $invoice): void
    {
        if ($invoice->status === 'Paid') {
            return;
        }

        $today = Carbon::today();
        $dueDate = Carbon::parse($invoice->due_date);

        if ($dueDate->lt($today) && $invoice->status !== 'Overdue') {
            $invoice->update(['status' => 'Overdue']);
        }
    }

    /**
     * Update overdue status for all invoices
     *
     * @return void
     */
    private function updateOverdueInvoices(): void
    {
        $today = Carbon::today();
        Invoice::where('status', '!=', 'Paid')
            ->where('due_date', '<', $today)
            ->where('status', '!=', 'Overdue')
            ->update(['status' => 'Overdue']);
    }

    /**
     * Update vendor totals based on invoices
     *
     * @param int $vendorId
     * @return void
     */
    private function updateVendorTotals(int $vendorId): void
    {
        $vendor = Vendor::find($vendorId);
        if (!$vendor) {
            return;
        }

        // Calculate total purchases (sum of all invoice amounts)
        $totalPurchases = Invoice::where('vendor_id', $vendorId)
            ->sum('amount');

        // Calculate outstanding (sum of unpaid invoices)
        $outstanding = Invoice::where('vendor_id', $vendorId)
            ->where('status', '!=', 'Paid')
            ->sum('amount');

        $vendor->update([
            'total_purchases' => $totalPurchases,
            'outstanding' => $outstanding,
        ]);
    }

    /**
     * Format invoice data for API response
     *
     * @param Invoice $invoice
     * @return array<string, mixed>
     */
    private function formatInvoice(Invoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'vendor_id' => $invoice->vendor_id,
            'vendor' => [
                'id' => $invoice->vendor->id,
                'name' => $invoice->vendor->name,
            ],
            'description' => $invoice->description,
            'invoice_date' => $invoice->invoice_date->format('Y-m-d'),
            'due_date' => $invoice->due_date->format('Y-m-d'),
            'amount' => (string) $invoice->amount,
            'category' => $invoice->category,
            'status' => $invoice->status,
            'created_at' => $invoice->created_at,
            'updated_at' => $invoice->updated_at,
        ];
    }
}

