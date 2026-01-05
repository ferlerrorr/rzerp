<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deduction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeductionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Deduction::with('employee');
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->input('employee_id'));
        }
        $deductions = $query->get();
        return response()->json(['success' => true, 'data' => ['deductions' => $deductions]]);
    }

    public function store(Request $request): JsonResponse
    {
        $deduction = Deduction::create($request->all());
        return response()->json(['success' => true, 'data' => $deduction], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $deduction = Deduction::findOrFail($id);
        $deduction->update($request->all());
        return response()->json(['success' => true, 'data' => $deduction]);
    }

    public function destroy(int $id): JsonResponse
    {
        Deduction::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Deduction deleted']);
    }
}
