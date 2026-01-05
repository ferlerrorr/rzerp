<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    /**
     * Get notifications for current user
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getNotifications(array $filters = []): array
    {
        $query = Notification::where('user_id', Auth::id());

        if (isset($filters['is_read'])) {
            $query->where('is_read', $filters['is_read']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $notifications = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'notifications' => $notifications->items(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ];
    }

    /**
     * Get unread count
     *
     * @return int
     */
    public function getUnreadCount(): int
    {
        return Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();
    }

    /**
     * Create a notification
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createNotification(array $data): array
    {
        try {
            $notification = Notification::create([
                'user_id' => $data['user_id'],
                'title' => $data['title'],
                'message' => $data['message'],
                'type' => $data['type'] ?? 'info',
            ]);

            return [
                'success' => true,
                'notification' => $this->formatNotification($notification),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create notification: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Mark notification as read
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function markAsRead(int $id): array
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$notification) {
            return [
                'success' => false,
                'message' => 'Notification not found',
                'status' => 404,
            ];
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return [
            'success' => true,
            'notification' => $this->formatNotification($notification),
        ];
    }

    /**
     * Mark all notifications as read
     *
     * @return array<string, mixed>
     */
    public function markAllAsRead(): array
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return [
            'success' => true,
        ];
    }

    /**
     * Delete a notification
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteNotification(int $id): array
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$notification) {
            return [
                'success' => false,
                'message' => 'Notification not found',
                'status' => 404,
            ];
        }

        $notification->delete();

        return [
            'success' => true,
        ];
    }

    /**
     * Format notification data for API response
     *
     * @param Notification $notification
     * @return array<string, mixed>
     */
    private function formatNotification(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'user_id' => $notification->user_id,
            'title' => $notification->title,
            'message' => $notification->message,
            'type' => $notification->type,
            'is_read' => $notification->is_read,
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
            'updated_at' => $notification->updated_at,
        ];
    }
}

