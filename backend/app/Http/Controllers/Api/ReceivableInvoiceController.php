<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReceivableInvoice\StoreReceivableInvoiceRequest;
use App\Http\Requests\ReceivableInvoice\UpdateReceivableInvoiceRequest;
use App\Services\ReceivableInvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReceivableInvoiceController extends Controller
{
    public function __construct(
        private readonly ReceivableInvoiceService $receivableInvoiceService
    ) {
    }

    /**
     * Get list of receivable invoices
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->receivableInvoiceService->getReceivableInvoices($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Receivable invoices retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single receivable invoice
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->receivableInvoiceService->getReceivableInvoice($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Receivable invoice retrieved successfully',
            'data' => $result['receivable_invoice'],
        ]);
    }

    /**
     * Create a new receivable invoice
     *
     * @param StoreReceivableInvoiceRequest $request
     * @return JsonResponse
     */
    public function store(StoreReceivableInvoiceRequest $request): JsonResponse
    {
        $result = $this->receivableInvoiceService->createReceivableInvoice($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Receivable invoice created successfully',
            'data' => $result['receivable_invoice'],
        ], 201);
    }

    /**
     * Update a receivable invoice
     *
     * @param UpdateReceivableInvoiceRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateReceivableInvoiceRequest $request, int $id): JsonResponse
    {
        $result = $this->receivableInvoiceService->updateReceivableInvoice($id, $request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Receivable invoice updated successfully',
            'data' => $result['receivable_invoice'],
        ]);
    }

    /**
     * Delete a receivable invoice
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->receivableInvoiceService->deleteReceivableInvoice($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Receivable invoice deleted successfully',
        ]);
    }
}
