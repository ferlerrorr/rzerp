<?php

namespace App\Services;

use App\Models\Setting;

class SettingService
{
    /**
     * Get all settings
     *
     * @return array<string, mixed>
     */
    public function getSettings(): array
    {
        $settings = Setting::all()->keyBy('key');

        return [
            'settings' => $settings->map(function ($setting) {
                return $this->formatSetting($setting);
            })->values()->all(),
        ];
    }

    /**
     * Get a single setting by key
     *
     * @param string $key
     * @return array<string, mixed>
     */
    public function getSetting(string $key): array
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return [
                'success' => false,
                'message' => 'Setting not found',
            ];
        }

        return [
            'success' => true,
            'setting' => $this->formatSetting($setting),
        ];
    }

    /**
     * Create or update a setting
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function setSetting(array $data): array
    {
        try {
            $setting = Setting::updateOrCreate(
                ['key' => $data['key']],
                [
                    'value' => $data['value'],
                    'type' => $data['type'] ?? 'string',
                    'description' => $data['description'] ?? null,
                ]
            );

            return [
                'success' => true,
                'setting' => $this->formatSetting($setting),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to save setting: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a setting
     *
     * @param string $key
     * @return array<string, mixed>
     */
    public function deleteSetting(string $key): array
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return [
                'success' => false,
                'message' => 'Setting not found',
                'status' => 404,
            ];
        }

        $setting->delete();

        return [
            'success' => true,
        ];
    }

    /**
     * Format setting data for API response
     *
     * @param Setting $setting
     * @return array<string, mixed>
     */
    private function formatSetting(Setting $setting): array
    {
        $value = $setting->value;

        // Cast value based on type
        if ($setting->type === 'boolean') {
            $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
        } elseif ($setting->type === 'number' || $setting->type === 'integer') {
            $value = is_numeric($value) ? (float) $value : $value;
        } elseif ($setting->type === 'json') {
            $value = json_decode($value, true);
        }

        return [
            'id' => $setting->id,
            'key' => $setting->key,
            'value' => $value,
            'type' => $setting->type,
            'description' => $setting->description,
            'created_at' => $setting->created_at,
            'updated_at' => $setting->updated_at,
        ];
    }
}

