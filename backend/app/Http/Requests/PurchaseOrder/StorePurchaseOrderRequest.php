<?php

namespace App\Http\Requests\PurchaseOrder;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
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
        return [
            'po_number' => ['nullable', 'string', 'max:255', 'unique:purchase_orders,po_number'],
            'vendor_id' => ['nullable', 'exists:vendors,id'],
            'vendor_name' => ['required', 'string', 'max:255'],
            'requested_by' => ['required', 'string', 'max:255'],
            'order_date' => ['required', 'date'],
            'expected_delivery' => ['required', 'date', 'after:order_date'],
            'status' => ['nullable', 'in:pending,approved,ordered,received'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_name' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
