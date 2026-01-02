<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\StoreVendorRequest;
use App\Http\Requests\Vendor\UpdateVendorRequest;
use App\Services\VendorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function __construct(
        private readonly VendorService $vendorService
    ) {
    }

    /**
     * Get list of vendors
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->vendorService->getVendors($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Vendors retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single vendor
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->vendorService->getVendor($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Vendor retrieved successfully',
            'data' => $result['vendor'],
        ]);
    }

    /**
     * Create a new vendor
     *
     * @param StoreVendorRequest $request
     * @return JsonResponse
     */
    public function store(StoreVendorRequest $request): JsonResponse
    {
        $result = $this->vendorService->createVendor($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Vendor created successfully',
            'data' => $result['vendor'],
        ], 201);
    }

    /**
     * Update a vendor
     *
     * @param UpdateVendorRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateVendorRequest $request, int $id): JsonResponse
    {
        $result = $this->vendorService->updateVendor($id, $request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Vendor updated successfully',
            'data' => $result['vendor'],
        ]);
    }

    /**
     * Delete a vendor
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->vendorService->deleteVendor($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Vendor deleted successfully',
        ]);
    }
}
