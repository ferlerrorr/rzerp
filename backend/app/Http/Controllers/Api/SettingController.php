<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function __construct(
        private readonly SettingService $settingService
    ) {
    }

    /**
     * Get all settings
     */
    public function index(): JsonResponse
    {
        $result = $this->settingService->getSettings();

        return response()->json([
            'success' => true,
            'message' => 'Settings retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single setting by key
     */
    public function show(string $key): JsonResponse
    {
        $result = $this->settingService->getSetting($key);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Setting retrieved successfully',
            'data' => $result['setting'],
        ]);
    }

    /**
     * Create or update a setting
     */
    public function store(Request $request): JsonResponse
    {
        $result = $this->settingService->setSetting($request->all());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Setting saved successfully',
            'data' => $result['setting'],
        ], 201);
    }

    /**
     * Update a setting
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $data = $request->all();
        $data['key'] = $key;
        $result = $this->settingService->setSetting($data);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => $result['setting'],
        ]);
    }

    /**
     * Delete a setting
     */
    public function destroy(string $key): JsonResponse
    {
        $result = $this->settingService->deleteSetting($key);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Setting deleted successfully',
        ]);
    }
}
