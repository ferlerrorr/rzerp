<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollEntry extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'payroll_run_id',
        'employee_id',
        'basic_salary',
        'overtime_pay',
        'holiday_pay',
        'night_differential',
        'allowances',
        'bonus',
        'thirteenth_month',
        'other_earnings',
        'gross_pay',
        'sss_contribution',
        'philhealth_contribution',
        'pagibig_contribution',
        'bir_tax',
        'leave_deductions',
        'loans',
        'other_deductions',
        'total_deductions',
        'net_pay',
        'is_approved',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'basic_salary' => 'decimal:2',
            'overtime_pay' => 'decimal:2',
            'holiday_pay' => 'decimal:2',
            'night_differential' => 'decimal:2',
            'allowances' => 'decimal:2',
            'bonus' => 'decimal:2',
            'thirteenth_month' => 'decimal:2',
            'other_earnings' => 'decimal:2',
            'gross_pay' => 'decimal:2',
            'sss_contribution' => 'decimal:2',
            'philhealth_contribution' => 'decimal:2',
            'pagibig_contribution' => 'decimal:2',
            'bir_tax' => 'decimal:2',
            'leave_deductions' => 'decimal:2',
            'loans' => 'decimal:2',
            'other_deductions' => 'decimal:2',
            'total_deductions' => 'decimal:2',
            'net_pay' => 'decimal:2',
            'is_approved' => 'boolean',
        ];
    }

    /**
     * Get the payroll run for this entry.
     */
    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    /**
     * Get the employee for this entry.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
