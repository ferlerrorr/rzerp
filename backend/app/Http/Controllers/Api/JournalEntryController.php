<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JournalEntry\StoreJournalEntryRequest;
use App\Http\Requests\JournalEntry\UpdateJournalEntryRequest;
use App\Services\JournalEntryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JournalEntryController extends Controller
{
    public function __construct(
        private readonly JournalEntryService $journalEntryService
    ) {
    }

    /**
     * Get list of journal entries
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->journalEntryService->getJournalEntries($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Journal entries retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single journal entry
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->journalEntryService->getJournalEntry($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Journal entry retrieved successfully',
            'data' => $result['journal_entry'],
        ]);
    }

    /**
     * Create a new journal entry
     *
     * @param StoreJournalEntryRequest $request
     * @return JsonResponse
     */
    public function store(StoreJournalEntryRequest $request): JsonResponse
    {
        $result = $this->journalEntryService->createJournalEntry($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Journal entry created successfully',
            'data' => $result['journal_entry'],
        ], 201);
    }

    /**
     * Update a journal entry
     *
     * @param UpdateJournalEntryRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateJournalEntryRequest $request, int $id): JsonResponse
    {
        $result = $this->journalEntryService->updateJournalEntry($id, $request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Journal entry updated successfully',
            'data' => $result['journal_entry'],
        ]);
    }

    /**
     * Delete a journal entry
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->journalEntryService->deleteJournalEntry($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Journal entry deleted successfully',
        ]);
    }

    /**
     * Post a journal entry (change status from Draft to Posted)
     *
     * @param int $id
     * @return JsonResponse
     */
    public function post(int $id): JsonResponse
    {
        $result = $this->journalEntryService->postJournalEntry($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Journal entry posted successfully',
            'data' => $result['journal_entry'],
        ]);
    }
}
