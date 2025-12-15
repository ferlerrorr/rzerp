<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
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
        $employeeId = $this->route('id');

        return [
            // Personal Information
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('employees')->ignore($employeeId)],
            'phone' => ['required', 'string', 'max:20'],
            'birth_date' => ['required', 'date'],
            'gender' => ['required', 'string', 'in:male,female,other'],
            'civil_status' => ['required', 'string', 'in:single,married,divorced,widowed'],
            
            // Address
            'street_address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:255'],
            'zip_code' => ['required', 'string', 'max:10'],
            
            // Government IDs
            'sss_number' => ['required', 'string', 'max:20', Rule::unique('employees')->ignore($employeeId)],
            'tin' => ['required', 'string', 'max:20', Rule::unique('employees')->ignore($employeeId)],
            'phil_health_number' => ['required', 'string', 'max:20', Rule::unique('employees')->ignore($employeeId)],
            'pag_ibig_number' => ['required', 'string', 'max:20', Rule::unique('employees')->ignore($employeeId)],
            
            // Employment Details
            'department' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'employment_type' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'monthly_salary' => ['required', 'numeric', 'min:0'],
            
            // Emergency Contact
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_phone' => ['required', 'string', 'max:20'],
            'emergency_contact_relationship' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Prepare the data for validation.
     * Convert camelCase from frontend to snake_case for backend
     */
    protected function prepareForValidation(): void
    {
        $data = $this->all();
        $mappedData = [];

        // Map camelCase to snake_case
        $fieldMapping = [
            'firstName' => 'first_name',
            'middleName' => 'middle_name',
            'lastName' => 'last_name',
            'birthDate' => 'birth_date',
            'civilStatus' => 'civil_status',
            'streetAddress' => 'street_address',
            'zipCode' => 'zip_code',
            'sssNumber' => 'sss_number',
            'philHealthNumber' => 'phil_health_number',
            'pagIbigNumber' => 'pag_ibig_number',
            'employmentType' => 'employment_type',
            'startDate' => 'start_date',
            'monthlySalary' => 'monthly_salary',
            'emergencyContactName' => 'emergency_contact_name',
            'emergencyContactPhone' => 'emergency_contact_phone',
            'emergencyContactRelationship' => 'emergency_contact_relationship',
        ];

        foreach ($data as $key => $value) {
            if (isset($fieldMapping[$key])) {
                $mappedData[$fieldMapping[$key]] = $value;
            } else {
                $mappedData[$key] = $value;
            }
        }

        $this->merge($mappedData);
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
