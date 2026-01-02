<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\ReceivableInvoice;
use App\Models\Customer;
use Carbon\Carbon;

class PaymentService
{
    /**
     * Record a payment for a receivable invoice
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function recordPayment(array $data): array
    {
        $invoice = ReceivableInvoice::find($data['receivable_invoice_id']);

        if (!$invoice) {
            return [
                'success' => false,
                'message' => 'Receivable invoice not found',
                'status' => 404,
            ];
        }

        try {
            $paymentAmount = $data['amount'];
            $currentBalance = (float) $invoice->balance;

            // Validate payment amount
            if ($paymentAmount <= 0) {
                return [
                    'success' => false,
                    'message' => 'Payment amount must be greater than 0',
                ];
            }

            if ($paymentAmount > $currentBalance) {
                return [
                    'success' => false,
                    'message' => 'Payment amount cannot exceed the invoice balance',
                ];
            }

            // Create payment record
            $payment = Payment::create([
                'receivable_invoice_id' => $data['receivable_invoice_id'],
                'amount' => $paymentAmount,
                'payment_date' => $data['payment_date'] ?? Carbon::today(),
                'payment_method' => $data['payment_method'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            // Update invoice balance and status
            $newBalance = max(0, $currentBalance - $paymentAmount);
            $invoice->balance = $newBalance;

            // Update status based on new balance
            if ($newBalance == 0) {
                $invoice->status = 'Paid';
            } elseif ($newBalance < (float) $invoice->amount) {
                $invoice->status = 'Partial';
            } else {
                // Recalculate status based on due date
                $today = Carbon::today();
                $dueDate = Carbon::parse($invoice->due_date);
                $invoice->status = $dueDate->lt($today) ? 'Overdue' : 'Pending';
            }

            $invoice->save();
            $invoice->load(['customer', 'payments']);

            // Update customer totals
            $this->updateCustomerTotals($invoice->customer_id);

            return [
                'success' => true,
                'payment' => $this->formatPayment($payment),
                'receivable_invoice' => [
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
                ],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to record payment: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get payments for a receivable invoice
     *
     * @param int $invoiceId
     * @return array<string, mixed>
     */
    public function getPaymentsForInvoice(int $invoiceId): array
    {
        $payments = Payment::where('receivable_invoice_id', $invoiceId)
            ->orderBy('payment_date', 'desc')
            ->get();

        return [
            'success' => true,
            'payments' => $payments->map(function ($payment) {
                return $this->formatPayment($payment);
            })->toArray(),
        ];
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
     * Format payment data for API response
     *
     * @param Payment $payment
     * @return array<string, mixed>
     */
    private function formatPayment(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'receivable_invoice_id' => $payment->receivable_invoice_id,
            'amount' => (string) $payment->amount,
            'payment_date' => $payment->payment_date->format('Y-m-d'),
            'payment_method' => $payment->payment_method,
            'notes' => $payment->notes,
            'created_at' => $payment->created_at,
            'updated_at' => $payment->updated_at,
        ];
    }

}

