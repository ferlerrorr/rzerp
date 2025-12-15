<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'phone',
        'birth_date',
        'gender',
        'civil_status',
        'street_address',
        'city',
        'province',
        'zip_code',
        'sss_number',
        'tin',
        'phil_health_number',
        'pag_ibig_number',
        'department',
        'position',
        'employment_type',
        'start_date',
        'monthly_salary',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'start_date' => 'date',
            'monthly_salary' => 'decimal:2',
        ];
    }
}
