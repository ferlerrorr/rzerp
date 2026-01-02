<?php

namespace App\Http\Requests\PurchaseOrder;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePurchaseOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $purchaseOrderId = $this->route('id');

        return [
            'po_number' => ['sometimes', 'string', 'max:255', Rule::unique('purchase_orders', 'po_number')->ignore($purchaseOrderId)],
            'vendor_id' => ['nullable', 'exists:vendors,id'],
            'vendor_name' => ['sometimes', 'string', 'max:255'],
            'requested_by' => ['sometimes', 'string', 'max:255'],
            'order_date' => ['sometimes', 'date'],
            'expected_delivery' => ['sometimes', 'date', 'after:order_date'],
            'status' => ['sometimes', 'in:pending,approved,ordered,received'],
            'notes' => ['nullable', 'string'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.product_name' => ['required_with:items', 'string', 'max:255'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.unit_price' => ['required_with:items', 'numeric', 'min:0'],
        ];
    }
}
