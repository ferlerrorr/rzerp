<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Vendor;

class PurchaseOrderService
{
    /**
     * Get list of purchase orders
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getPurchaseOrders(array $filters = []): array
    {
        $query = PurchaseOrder::with('items', 'vendor');

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                  ->orWhere('vendor_name', 'like', "%{$search}%")
                  ->orWhere('requested_by', 'like', "%{$search}%");
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['vendor_id'])) {
            $query->where('vendor_id', $filters['vendor_id']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $purchaseOrders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'purchase_orders' => collect($purchaseOrders->items())->map(function ($po) {
                return $this->formatPurchaseOrder($po);
            })->toArray(),
            'pagination' => [
                'current_page' => $purchaseOrders->currentPage(),
                'last_page' => $purchaseOrders->lastPage(),
                'per_page' => $purchaseOrders->perPage(),
                'total' => $purchaseOrders->total(),
            ],
        ];
    }

    /**
     * Get a single purchase order
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getPurchaseOrder(int $id): array
    {
        $purchaseOrder = PurchaseOrder::with('items', 'vendor')->find($id);

        if (!$purchaseOrder) {
            return [
                'success' => false,
                'message' => 'Purchase order not found',
            ];
        }

        return [
            'success' => true,
            'purchase_order' => $this->formatPurchaseOrder($purchaseOrder),
        ];
    }

    /**
     * Create a new purchase order
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createPurchaseOrder(array $data): array
    {
        try {
            // Get vendor name if vendor_id is provided
            $vendorName = $data['vendor_name'] ?? '';
            if (isset($data['vendor_id']) && $data['vendor_id']) {
                $vendor = Vendor::find($data['vendor_id']);
                if ($vendor) {
                    $vendorName = $vendor->company_name;
                }
            }

            // Calculate total amount from items
            $totalAmount = 0;
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $totalAmount += ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                }
            }

            // Generate PO number if not provided
            $poNumber = $data['po_number'] ?? $this->generatePONumber();

            $purchaseOrder = PurchaseOrder::create([
                'po_number' => $poNumber,
                'vendor_id' => $data['vendor_id'] ?? null,
                'vendor_name' => $vendorName,
                'requested_by' => $data['requested_by'],
                'order_date' => $data['order_date'],
                'expected_delivery' => $data['expected_delivery'],
                'total_amount' => $totalAmount,
                'status' => $data['status'] ?? 'pending',
                'notes' => $data['notes'] ?? null,
            ]);

            // Create purchase order items
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    PurchaseOrderItem::create([
                        'purchase_order_id' => $purchaseOrder->id,
                        'product_name' => $item['product_name'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0),
                    ]);
                }
            }

            return [
                'success' => true,
                'purchase_order' => $this->formatPurchaseOrder($purchaseOrder->load('items', 'vendor')),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create purchase order: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a purchase order
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updatePurchaseOrder(int $id, array $data): array
    {
        $purchaseOrder = PurchaseOrder::find($id);

        if (!$purchaseOrder) {
            return [
                'success' => false,
                'message' => 'Purchase order not found',
                'status' => 404,
            ];
        }

        // Prevent updating if status is 'received'
        if ($purchaseOrder->status === 'received') {
            return [
                'success' => false,
                'message' => 'Cannot update a received purchase order',
            ];
        }

        try {
            // Get vendor name if vendor_id is provided
            if (isset($data['vendor_id']) && $data['vendor_id']) {
                $vendor = Vendor::find($data['vendor_id']);
                if ($vendor) {
                    $data['vendor_name'] = $vendor->company_name;
                }
            }

            // Update items if provided
            if (isset($data['items']) && is_array($data['items'])) {
                // Delete existing items
                $purchaseOrder->items()->delete();

                // Calculate total amount
                $totalAmount = 0;
                foreach ($data['items'] as $item) {
                    $subtotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                    $totalAmount += $subtotal;

                    PurchaseOrderItem::create([
                        'purchase_order_id' => $purchaseOrder->id,
                        'product_name' => $item['product_name'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $subtotal,
                    ]);
                }
                $data['total_amount'] = $totalAmount;
            }

            $purchaseOrder->update($data);

            return [
                'success' => true,
                'purchase_order' => $this->formatPurchaseOrder($purchaseOrder->fresh()->load('items', 'vendor')),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update purchase order: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update purchase order status
     *
     * @param int $id
     * @param string $status
     * @return array<string, mixed>
     */
    public function updateStatus(int $id, string $status): array
    {
        $purchaseOrder = PurchaseOrder::find($id);

        if (!$purchaseOrder) {
            return [
                'success' => false,
                'message' => 'Purchase order not found',
                'status' => 404,
            ];
        }

        $validStatuses = ['pending', 'approved', 'ordered', 'received'];
        if (!in_array($status, $validStatuses)) {
            return [
                'success' => false,
                'message' => 'Invalid status',
            ];
        }

        try {
            $purchaseOrder->update(['status' => $status]);

            return [
                'success' => true,
                'purchase_order' => $this->formatPurchaseOrder($purchaseOrder->fresh()->load('items', 'vendor')),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update status: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a purchase order
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deletePurchaseOrder(int $id): array
    {
        $purchaseOrder = PurchaseOrder::find($id);

        if (!$purchaseOrder) {
            return [
                'success' => false,
                'message' => 'Purchase order not found',
                'status' => 404,
            ];
        }

        // Prevent deleting if status is 'ordered' or 'received'
        if (in_array($purchaseOrder->status, ['ordered', 'received'])) {
            return [
                'success' => false,
                'message' => 'Cannot delete a purchase order that has been ordered or received',
            ];
        }

        try {
            $purchaseOrder->delete();

            return [
                'success' => true,
                'message' => 'Purchase order deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete purchase order: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Format purchase order data for API response
     *
     * @param PurchaseOrder $purchaseOrder
     * @return array<string, mixed>
     */
    private function formatPurchaseOrder(PurchaseOrder $purchaseOrder): array
    {
        return [
            'id' => $purchaseOrder->id,
            'po_number' => $purchaseOrder->po_number,
            'vendor_id' => $purchaseOrder->vendor_id,
            'vendor_name' => $purchaseOrder->vendor_name,
            'requested_by' => $purchaseOrder->requested_by,
            'order_date' => $purchaseOrder->order_date->format('Y-m-d'),
            'expected_delivery' => $purchaseOrder->expected_delivery->format('Y-m-d'),
            'total_amount' => (string) $purchaseOrder->total_amount,
            'status' => $purchaseOrder->status,
            'notes' => $purchaseOrder->notes,
            'items' => $purchaseOrder->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'unit_price' => (string) $item->unit_price,
                    'subtotal' => (string) $item->subtotal,
                ];
            })->toArray(),
            'created_at' => $purchaseOrder->created_at,
            'updated_at' => $purchaseOrder->updated_at,
        ];
    }

    /**
     * Generate a unique PO number
     *
     * @return string
     */
    private function generatePONumber(): string
    {
        $year = date('Y');
        $lastPO = PurchaseOrder::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastPO) {
            // Extract number from PO-YYYY-XXX format
            $parts = explode('-', $lastPO->po_number);
            $lastNumber = isset($parts[2]) ? (int) $parts[2] : 0;
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('PO-%s-%03d', $year, $nextNumber);
    }
}

