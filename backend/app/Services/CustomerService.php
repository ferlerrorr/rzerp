<?php

namespace App\Services;

use App\Models\Customer;

class CustomerService
{
    /**
     * Get list of customers
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getCustomers(array $filters = []): array
    {
        $query = Customer::query();

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

        $perPage = $filters['per_page'] ?? 100;
        $customers = $query->orderBy('company_name', 'asc')->paginate($perPage);

        return [
            'customers' => $customers->items(),
            'pagination' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ];
    }

    /**
     * Get a single customer
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getCustomer(int $id): array
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return [
                'success' => false,
                'message' => 'Customer not found',
            ];
        }

        return [
            'success' => true,
            'customer' => $this->formatCustomer($customer),
        ];
    }

    /**
     * Create a new customer
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createCustomer(array $data): array
    {
        try {
            $customer = Customer::create([
                'company_name' => $data['company_name'],
                'contact_person' => $data['contact_person'] ?? null,
                'email' => $data['email'],
                'phone' => $data['phone'],
                'address' => $data['address'],
                'tin' => $data['tin'] ?? null,
                'payment_terms' => $data['payment_terms'] ?? null,
                'status' => $data['status'] ?? 'Active',
                'total_receivables' => 0,
                'outstanding' => 0,
            ]);

            return [
                'success' => true,
                'customer' => $this->formatCustomer($customer),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create customer: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Format customer data for API response
     *
     * @param Customer $customer
     * @return array<string, mixed>
     */
    private function formatCustomer(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'company_name' => $customer->company_name,
            'contact_person' => $customer->contact_person,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'tin' => $customer->tin,
            'payment_terms' => $customer->payment_terms,
            'status' => $customer->status,
            'total_receivables' => (string) $customer->total_receivables,
            'outstanding' => (string) $customer->outstanding,
            'created_at' => $customer->created_at,
            'updated_at' => $customer->updated_at,
        ];
    }
}

