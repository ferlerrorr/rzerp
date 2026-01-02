<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService
    ) {
    }

    /**
     * Record a payment for a receivable invoice
     *
     * @param StorePaymentRequest $request
     * @return JsonResponse
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $result = $this->paymentService->recordPayment($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data' => $result,
        ], 201);
    }

    /**
     * Get payments for a receivable invoice
     *
     * @param int $invoiceId
     * @return JsonResponse
     */
    public function getByInvoice(int $invoiceId): JsonResponse
    {
        $result = $this->paymentService->getPaymentsForInvoice($invoiceId);

        return response()->json([
            'success' => true,
            'message' => 'Payments retrieved successfully',
            'data' => $result,
        ]);
    }
}
