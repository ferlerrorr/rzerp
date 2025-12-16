<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// CSRF cookie endpoint (for session-based auth)
// This must be in web.php (not api.php) so it's accessible at /csrf-cookie without /api prefix
Route::get('/csrf-cookie', function () {
    return response()->json(['success' => true, 'message' => 'CSRF cookie set']);
});
