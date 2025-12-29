<?php

namespace App\Services;

use App\Models\JournalEntry;
use App\Models\Account;

class JournalEntryService
{
    /**
     * Get list of journal entries with pagination
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getJournalEntries(array $filters = []): array
    {
        $query = JournalEntry::with(['debitAccount', 'creditAccount']);

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->where('date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $journalEntries = $query->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return [
            'journal_entries' => $journalEntries->items(),
            'pagination' => [
                'current_page' => $journalEntries->currentPage(),
                'last_page' => $journalEntries->lastPage(),
                'per_page' => $journalEntries->perPage(),
                'total' => $journalEntries->total(),
            ],
        ];
    }

    /**
     * Get a single journal entry
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getJournalEntry(int $id): array
    {
        $journalEntry = JournalEntry::with(['debitAccount', 'creditAccount'])->find($id);

        if (!$journalEntry) {
            return [
                'success' => false,
                'message' => 'Journal entry not found',
            ];
        }

        return [
            'success' => true,
            'journal_entry' => $this->formatJournalEntry($journalEntry),
        ];
    }

    /**
     * Create a new journal entry
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createJournalEntry(array $data): array
    {
        try {
            // Validate that accounts exist
            $debitAccount = Account::find($data['debit_account_id']);
            $creditAccount = Account::find($data['credit_account_id']);

            if (!$debitAccount) {
                return [
                    'success' => false,
                    'message' => 'Debit account not found',
                ];
            }

            if (!$creditAccount) {
                return [
                    'success' => false,
                    'message' => 'Credit account not found',
                ];
            }

            // Validate accounts are different
            if ($data['debit_account_id'] === $data['credit_account_id']) {
                return [
                    'success' => false,
                    'message' => 'Debit and Credit accounts must be different',
                ];
            }

            $journalEntry = JournalEntry::create([
                'date' => $data['date'],
                'reference_number' => $data['reference_number'],
                'description' => $data['description'],
                'debit_account_id' => $data['debit_account_id'],
                'credit_account_id' => $data['credit_account_id'],
                'amount' => $data['amount'],
                'status' => $data['status'] ?? 'Draft',
            ]);

            return [
                'success' => true,
                'journal_entry' => $this->formatJournalEntry($journalEntry->load(['debitAccount', 'creditAccount'])),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create journal entry: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a journal entry
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateJournalEntry(int $id, array $data): array
    {
        $journalEntry = JournalEntry::find($id);

        if (!$journalEntry) {
            return [
                'success' => false,
                'message' => 'Journal entry not found',
                'status' => 404,
            ];
        }

        // Prevent editing posted entries
        if ($journalEntry->status === 'Posted') {
            return [
                'success' => false,
                'message' => 'Cannot edit posted journal entry',
                'status' => 422,
            ];
        }

        try {
            // Validate accounts if provided
            if (isset($data['debit_account_id'])) {
                $debitAccount = Account::find($data['debit_account_id']);
                if (!$debitAccount) {
                    return [
                        'success' => false,
                        'message' => 'Debit account not found',
                    ];
                }
            }

            if (isset($data['credit_account_id'])) {
                $creditAccount = Account::find($data['credit_account_id']);
                if (!$creditAccount) {
                    return [
                        'success' => false,
                        'message' => 'Credit account not found',
                    ];
                }
            }

            // Validate accounts are different
            $debitId = $data['debit_account_id'] ?? $journalEntry->debit_account_id;
            $creditId = $data['credit_account_id'] ?? $journalEntry->credit_account_id;
            if ($debitId === $creditId) {
                return [
                    'success' => false,
                    'message' => 'Debit and Credit accounts must be different',
                ];
            }

            $journalEntry->update($data);

            return [
                'success' => true,
                'journal_entry' => $this->formatJournalEntry($journalEntry->fresh()->load(['debitAccount', 'creditAccount'])),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update journal entry: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a journal entry
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteJournalEntry(int $id): array
    {
        $journalEntry = JournalEntry::find($id);

        if (!$journalEntry) {
            return [
                'success' => false,
                'message' => 'Journal entry not found',
                'status' => 404,
            ];
        }

        // Prevent deleting posted entries
        if ($journalEntry->status === 'Posted') {
            return [
                'success' => false,
                'message' => 'Cannot delete posted journal entry',
                'status' => 422,
            ];
        }

        try {
            $journalEntry->delete();

            return [
                'success' => true,
                'message' => 'Journal entry deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete journal entry: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Post a journal entry (change status from Draft to Posted)
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function postJournalEntry(int $id): array
    {
        $journalEntry = JournalEntry::find($id);

        if (!$journalEntry) {
            return [
                'success' => false,
                'message' => 'Journal entry not found',
                'status' => 404,
            ];
        }

        if ($journalEntry->status === 'Posted') {
            return [
                'success' => false,
                'message' => 'Journal entry is already posted',
                'status' => 422,
            ];
        }

        try {
            $journalEntry->update(['status' => 'Posted']);

            return [
                'success' => true,
                'journal_entry' => $this->formatJournalEntry($journalEntry->fresh()->load(['debitAccount', 'creditAccount'])),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to post journal entry: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Format journal entry data for API response
     *
     * @param JournalEntry $journalEntry
     * @return array<string, mixed>
     */
    private function formatJournalEntry(JournalEntry $journalEntry): array
    {
        return [
            'id' => $journalEntry->id,
            'date' => $journalEntry->date->format('Y-m-d'),
            'reference_number' => $journalEntry->reference_number,
            'description' => $journalEntry->description,
            'debit_account_id' => $journalEntry->debit_account_id,
            'credit_account_id' => $journalEntry->credit_account_id,
            'debit_account' => [
                'id' => $journalEntry->debitAccount->id,
                'code' => $journalEntry->debitAccount->code,
                'account_name' => $journalEntry->debitAccount->account_name,
            ],
            'credit_account' => [
                'id' => $journalEntry->creditAccount->id,
                'code' => $journalEntry->creditAccount->code,
                'account_name' => $journalEntry->creditAccount->account_name,
            ],
            'amount' => (string) $journalEntry->amount,
            'status' => $journalEntry->status,
            'created_at' => $journalEntry->created_at,
            'updated_at' => $journalEntry->updated_at,
        ];
    }
}

