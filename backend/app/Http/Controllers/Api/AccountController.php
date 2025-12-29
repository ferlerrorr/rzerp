<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreAccountRequest;
use App\Http\Requests\Account\UpdateAccountRequest;
use App\Services\AccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function __construct(
        private readonly AccountService $accountService
    ) {
    }

    /**
     * Get list of accounts
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->accountService->getAccounts($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Accounts retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single account
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->accountService->getAccount($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Account retrieved successfully',
            'data' => $result['account'],
        ]);
    }

    /**
     * Create a new account
     *
     * @param StoreAccountRequest $request
     * @return JsonResponse
     */
    public function store(StoreAccountRequest $request): JsonResponse
    {
        $result = $this->accountService->createAccount($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully',
            'data' => $result['account'],
        ], 201);
    }

    /**
     * Update an account
     *
     * @param UpdateAccountRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateAccountRequest $request, int $id): JsonResponse
    {
        $result = $this->accountService->updateAccount($id, $request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Account updated successfully',
            'data' => $result['account'],
        ]);
    }

    /**
     * Delete an account
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->accountService->deleteAccount($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully',
        ]);
    }
}
