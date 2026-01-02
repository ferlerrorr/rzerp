<?php

namespace App\Services;

use App\Models\Vendor;

class VendorService
{
    /**
     * Get list of vendors
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getVendors(array $filters = []): array
    {
        $query = Vendor::query();

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        $perPage = $filters['per_page'] ?? 100;
        $vendors = $query->orderBy('company_name', 'asc')->paginate($perPage);

        return [
            'vendors' => $vendors->items(),
            'pagination' => [
                'current_page' => $vendors->currentPage(),
                'last_page' => $vendors->lastPage(),
                'per_page' => $vendors->perPage(),
                'total' => $vendors->total(),
            ],
        ];
    }

    /**
     * Get a single vendor
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getVendor(int $id): array
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return [
                'success' => false,
                'message' => 'Vendor not found',
            ];
        }

        return [
            'success' => true,
            'vendor' => $this->formatVendor($vendor),
        ];
    }

    /**
     * Create a new vendor
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createVendor(array $data): array
    {
        try {
            $vendor = Vendor::create([
                'company_name' => $data['company_name'],
                'contact_person' => $data['contact_person'] ?? null,
                'category' => $data['category'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'address' => $data['address'],
                'tin' => $data['tin'] ?? null,
                'payment_terms' => $data['payment_terms'] ?? null,
                'status' => $data['status'] ?? 'Active',
                'total_purchases' => 0,
                'outstanding' => 0,
            ]);

            return [
                'success' => true,
                'vendor' => $this->formatVendor($vendor),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create vendor: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a vendor
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateVendor(int $id, array $data): array
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return [
                'success' => false,
                'message' => 'Vendor not found',
                'status' => 404,
            ];
        }

        try {
            $vendor->update($data);

            return [
                'success' => true,
                'vendor' => $this->formatVendor($vendor->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update vendor: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a vendor
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteVendor(int $id): array
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return [
                'success' => false,
                'message' => 'Vendor not found',
                'status' => 404,
            ];
        }

        try {
            $vendor->delete();

            return [
                'success' => true,
                'message' => 'Vendor deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete vendor: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Format vendor data for API response
     *
     * @param Vendor $vendor
     * @return array<string, mixed>
     */
    private function formatVendor(Vendor $vendor): array
    {
        return [
            'id' => $vendor->id,
            'company_name' => $vendor->company_name,
            'contact_person' => $vendor->contact_person,
            'category' => $vendor->category,
            'email' => $vendor->email,
            'phone' => $vendor->phone,
            'address' => $vendor->address,
            'tin' => $vendor->tin,
            'payment_terms' => $vendor->payment_terms,
            'status' => $vendor->status,
            'total_purchases' => (string) $vendor->total_purchases,
            'outstanding' => (string) $vendor->outstanding,
            'created_at' => $vendor->created_at,
            'updated_at' => $vendor->updated_at,
        ];
    }
}

