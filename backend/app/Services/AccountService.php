<?php

namespace App\Services;

use App\Models\Account;

class AccountService
{
    /**
     * Get list of accounts with pagination
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getAccounts(array $filters = []): array
    {
        $query = Account::query();

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('account_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if (isset($filters['account_type'])) {
            $query->where('account_type', $filters['account_type']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $accounts = $query->orderBy('code', 'asc')->paginate($perPage);

        return [
            'accounts' => $accounts->items(),
            'pagination' => [
                'current_page' => $accounts->currentPage(),
                'last_page' => $accounts->lastPage(),
                'per_page' => $accounts->perPage(),
                'total' => $accounts->total(),
            ],
        ];
    }

    /**
     * Get a single account
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getAccount(int $id): array
    {
        $account = Account::find($id);

        if (!$account) {
            return [
                'success' => false,
                'message' => 'Account not found',
            ];
        }

        return [
            'success' => true,
            'account' => $this->formatAccount($account),
        ];
    }

    /**
     * Create a new account
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createAccount(array $data): array
    {
        try {
            $account = Account::create([
                'account_type' => $data['account_type'],
                'code' => $data['code'],
                'account_name' => $data['account_name'],
                'debit' => $data['debit'] ?? 0,
                'credit' => $data['credit'] ?? 0,
            ]);

            return [
                'success' => true,
                'account' => $this->formatAccount($account),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create account: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update an account
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateAccount(int $id, array $data): array
    {
        $account = Account::find($id);

        if (!$account) {
            return [
                'success' => false,
                'message' => 'Account not found',
                'status' => 404,
            ];
        }

        try {
            $updateData = [
                'account_type' => $data['account_type'],
                'code' => $data['code'],
                'account_name' => $data['account_name'],
                'debit' => $data['debit'] ?? $account->debit,
                'credit' => $data['credit'] ?? $account->credit,
            ];

            $account->update($updateData);

            return [
                'success' => true,
                'account' => $this->formatAccount($account->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update account: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete an account
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteAccount(int $id): array
    {
        $account = Account::find($id);

        if (!$account) {
            return [
                'success' => false,
                'message' => 'Account not found',
                'status' => 404,
            ];
        }

        try {
            $account->delete();

            return [
                'success' => true,
                'message' => 'Account deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete account: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Format account data for API response
     *
     * @param Account $account
     * @return array<string, mixed>
     */
    private function formatAccount(Account $account): array
    {
        return [
            'id' => $account->id,
            'account_type' => $account->account_type,
            'code' => $account->code,
            'account_name' => $account->account_name,
            'debit' => (string) $account->debit,
            'credit' => (string) $account->credit,
            'created_at' => $account->created_at,
            'updated_at' => $account->updated_at,
        ];
    }
}

