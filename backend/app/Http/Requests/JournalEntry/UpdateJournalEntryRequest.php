<?php

namespace App\Http\Requests\JournalEntry;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateJournalEntryRequest extends FormRequest
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
        $journalEntryId = $this->route('id');

        return [
            'date' => ['sometimes', 'required', 'date'],
            'reference_number' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('journal_entries')->ignore($journalEntryId)],
            'description' => ['sometimes', 'required', 'string', 'max:1000'],
            'debit_account_id' => ['sometimes', 'required', 'integer', 'exists:accounts,id'],
            'credit_account_id' => ['sometimes', 'required', 'integer', 'exists:accounts,id', 'different:debit_account_id'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'status' => ['sometimes', 'nullable', 'string', 'in:Draft,Posted'],
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param Validator $validator
     * @return void
     *
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()->toArray(),
            ], 422)
        );
    }
}
