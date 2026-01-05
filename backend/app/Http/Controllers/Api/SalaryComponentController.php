<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalaryComponent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalaryComponentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SalaryComponent::with('employee');
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->input('employee_id'));
        }
        $components = $query->get();
        return response()->json(['success' => true, 'data' => ['salary_components' => $components]]);
    }

    public function store(Request $request): JsonResponse
    {
        $component = SalaryComponent::create($request->all());
        return response()->json(['success' => true, 'data' => $component], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $component = SalaryComponent::findOrFail($id);
        $component->update($request->all());
        return response()->json(['success' => true, 'data' => $component]);
    }

    public function destroy(int $id): JsonResponse
    {
        SalaryComponent::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Salary component deleted']);
    }
}
