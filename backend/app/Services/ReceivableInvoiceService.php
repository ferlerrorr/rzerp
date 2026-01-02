<?php

namespace App\Services;

use App\Models\ReceivableInvoice;
use App\Models\Customer;
use Carbon\Carbon;

class ReceivableInvoiceService
{
    /**
     * Get list of receivable invoices with pagination
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getReceivableInvoices(array $filters = []): array
    {
        $query = ReceivableInvoice::with('customer');

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($customerQuery) use ($search) {
                      $customerQuery->where('company_name', 'like', "%{$search}%");
                  });
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        // Update overdue status before fetching
        $this->updateOverdueInvoices();

        $perPage = $filters['per_page'] ?? 15;
        $invoices = $query->orderBy('invoice_date', 'desc')->paginate($perPage);

        return [
            'receivable_invoices' => $invoices->items(),
            'pagination' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
        ];
    }

    /**
     * Get a single receivable invoice
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getReceivableInvoice(int $id): array
    {
        $invoice = ReceivableInvoice::with(['customer', 'payments'])->find($id);

        if (!$invoice) {
            return [
                'success' => false,
                'message' => 'Receivable invoice not found',
            ];
        }

        // Update overdue status if needed
        $this->updateOverdueStatus($invoice);

        return [
            'success' => true,
            'receivable_invoice' => $this->formatReceivableInvoice($invoice),
        ];
    }

    /**
     * Create a new receivable invoice
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createReceivableInvoice(array $data): array
    {
        try {
            // Calculate status based on due date
            $status = $this->calculateStatus($data['due_date']);

            $invoice = ReceivableInvoice::create([
                'invoice_number' => $data['invoice_number'],
                'customer_id' => $data['customer_id'],
                'description' => $data['description'],
                'invoice_date' => $data['invoice_date'],
                'due_date' => $data['due_date'],
                'amount' => $data['amount'],
                'balance' => $data['amount'], // Initial balance equals amount
                'payment_terms' => $data['payment_terms'] ?? null,
                'status' => $status,
            ]);

            $invoice->load('customer');

            // Update customer totals
            $this->updateCustomerTotals($invoice->customer_id);

            return [
                'success' => true,
                'receivable_invoice' => $this->formatReceivableInvoice($invoice),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create receivable invoice: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a receivable invoice
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateReceivableInvoice(int $id, array $data): array
    {
        $invoice = ReceivableInvoice::find($id);

        if (!$invoice) {
            return [
                'success' => false,
                'message' => 'Receivable invoice not found',
                'status' => 404,
            ];
        }

        try {
            // Recalculate status if due_date is being updated
            if (isset($data['due_date'])) {
                $data['status'] = $this->calculateStatus($data['due_date'], $invoice->status, $invoice->balance, $invoice->amount);
            }

            $oldCustomerId = $invoice->customer_id;
            $invoice->update($data);
            $invoice->load('customer');

            // Update customer totals for old and new customer (if changed)
            $this->updateCustomerTotals($oldCustomerId);
            if (isset($data['customer_id']) && $data['customer_id'] != $oldCustomerId) {
                $this->updateCustomerTotals($data['customer_id']);
            }

            return [
                'success' => true,
                'receivable_invoice' => $this->formatReceivableInvoice($invoice->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update receivable invoice: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a receivable invoice
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteReceivableInvoice(int $id): array
    {
        $invoice = ReceivableInvoice::find($id);

        if (!$invoice) {
            return [
                'success' => false,
                'message' => 'Receivable invoice not found',
                'status' => 404,
            ];
        }

        try {
            $customerId = $invoice->customer_id;
            $invoice->delete();

            // Update customer totals
            $this->updateCustomerTotals($customerId);

            return [
                'success' => true,
                'message' => 'Receivable invoice deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete receivable invoice: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Calculate invoice status based on due date and balance
     *
     * @param string $dueDate
     * @param string|null $currentStatus
     * @param float|null $balance
     * @param float|null $amount
     * @return string
     */
    private function calculateStatus(string $dueDate, ?string $currentStatus = null, ?float $balance = null, ?float $amount = null): string
    {
        // If balance is 0, status is Paid
        if ($balance !== null && $balance == 0) {
            return 'Paid';
        }

        // If balance is less than amount, status is Partial
        if ($balance !== null && $amount !== null && $balance < $amount && $balance > 0) {
            return 'Partial';
        }

        // If already Paid, keep it Paid
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
     * @param ReceivableInvoice $invoice
     * @return void
     */
    private function updateOverdueStatus(ReceivableInvoice $invoice): void
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
        ReceivableInvoice::where('status', '!=', 'Paid')
            ->where('due_date', '<', $today)
            ->where('status', '!=', 'Overdue')
            ->update(['status' => 'Overdue']);
    }

    /**
     * Update customer totals based on receivable invoices
     *
     * @param int $customerId
     * @return void
     */
    private function updateCustomerTotals(int $customerId): void
    {
        $customer = Customer::find($customerId);
        if (!$customer) {
            return;
        }

        // Calculate total receivables (sum of all invoice amounts)
        $totalReceivables = ReceivableInvoice::where('customer_id', $customerId)
            ->sum('amount');

        // Calculate outstanding (sum of unpaid invoices balance)
        $outstanding = ReceivableInvoice::where('customer_id', $customerId)
            ->where('status', '!=', 'Paid')
            ->sum('balance');

        $customer->update([
            'total_receivables' => $totalReceivables,
            'outstanding' => $outstanding,
        ]);
    }

    /**
     * Format receivable invoice data for API response
     *
     * @param ReceivableInvoice $invoice
     * @return array<string, mixed>
     */
    private function formatReceivableInvoice(ReceivableInvoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'customer_id' => $invoice->customer_id,
            'customer' => [
                'id' => $invoice->customer->id,
                'company_name' => $invoice->customer->company_name,
            ],
            'description' => $invoice->description,
            'invoice_date' => $invoice->invoice_date->format('Y-m-d'),
            'due_date' => $invoice->due_date->format('Y-m-d'),
            'amount' => (string) $invoice->amount,
            'balance' => (string) $invoice->balance,
            'payment_terms' => $invoice->payment_terms,
            'status' => $invoice->status,
            'created_at' => $invoice->created_at,
            'updated_at' => $invoice->updated_at,
        ];
    }
}

