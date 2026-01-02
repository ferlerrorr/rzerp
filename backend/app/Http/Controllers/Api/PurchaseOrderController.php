<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseOrder\StorePurchaseOrderRequest;
use App\Http\Requests\PurchaseOrder\UpdatePurchaseOrderRequest;
use App\Services\PurchaseOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{
    public function __construct(
        private readonly PurchaseOrderService $purchaseOrderService
    ) {
    }

    /**
     * Get list of purchase orders
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->purchaseOrderService->getPurchaseOrders($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Purchase orders retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single purchase order
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->purchaseOrderService->getPurchaseOrder($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Purchase order retrieved successfully',
            'data' => $result['purchase_order'],
        ]);
    }

    /**
     * Create a new purchase order
     *
     * @param StorePurchaseOrderRequest $request
     * @return JsonResponse
     */
    public function store(StorePurchaseOrderRequest $request): JsonResponse
    {
        $result = $this->purchaseOrderService->createPurchaseOrder($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Purchase order created successfully',
            'data' => $result['purchase_order'],
        ], 201);
    }

    /**
     * Update a purchase order
     *
     * @param UpdatePurchaseOrderRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdatePurchaseOrderRequest $request, int $id): JsonResponse
    {
        $result = $this->purchaseOrderService->updatePurchaseOrder($id, $request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Purchase order updated successfully',
            'data' => $result['purchase_order'],
        ]);
    }

    /**
     * Update purchase order status
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending,approved,ordered,received'],
        ]);

        $result = $this->purchaseOrderService->updateStatus($id, $request->status);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Purchase order status updated successfully',
            'data' => $result['purchase_order'],
        ]);
    }

    /**
     * Delete a purchase order
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->purchaseOrderService->deletePurchaseOrder($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Purchase order deleted successfully',
        ]);
    }
}
