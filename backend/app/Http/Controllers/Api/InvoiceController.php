<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Http\Requests\Invoice\UpdateInvoiceRequest;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceService $invoiceService
    ) {
    }

    /**
     * Get list of invoices
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->invoiceService->getInvoices($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Invoices retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single invoice
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->invoiceService->getInvoice($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Invoice retrieved successfully',
            'data' => $result['invoice'],
        ]);
    }

    /**
     * Create a new invoice
     *
     * @param StoreInvoiceRequest $request
     * @return JsonResponse
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $result = $this->invoiceService->createInvoice($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Invoice created successfully',
            'data' => $result['invoice'],
        ], 201);
    }

    /**
     * Update an invoice
     *
     * @param UpdateInvoiceRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateInvoiceRequest $request, int $id): JsonResponse
    {
        $result = $this->invoiceService->updateInvoice($id, $request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Invoice updated successfully',
            'data' => $result['invoice'],
        ]);
    }

    /**
     * Delete an invoice
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->invoiceService->deleteInvoice($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Invoice deleted successfully',
        ]);
    }

    /**
     * Approve an invoice
     *
     * @param int $id
     * @return JsonResponse
     */
    public function approve(int $id): JsonResponse
    {
        $result = $this->invoiceService->approveInvoice($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Invoice approved successfully',
            'data' => $result['invoice'],
        ]);
    }

    /**
     * Mark invoice as paid
     *
     * @param int $id
     * @return JsonResponse
     */
    public function pay(int $id): JsonResponse
    {
        $result = $this->invoiceService->payInvoice($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Invoice marked as paid successfully',
            'data' => $result['invoice'],
        ]);
    }
}
