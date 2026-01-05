<?php

namespace App\Services;

use App\Models\PayrollPeriod;
use App\Models\PayrollRun;
use App\Models\PayrollEntry;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\SalaryComponent;
use App\Models\Deduction;
use App\Models\LeaveRequest;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PayrollService
{
    /**
     * Get list of payroll periods
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getPayrollPeriods(array $filters = []): array
    {
        $query = PayrollPeriod::query();

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $periods = $query->orderBy('start_date', 'desc')->paginate($perPage);

        return [
            'payroll_periods' => $periods->map(function ($period) {
                return $this->formatPayrollPeriod($period);
            })->all(),
            'pagination' => [
                'current_page' => $periods->currentPage(),
                'last_page' => $periods->lastPage(),
                'per_page' => $periods->perPage(),
                'total' => $periods->total(),
            ],
        ];
    }

    /**
     * Get list of payroll runs
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getPayrollRuns(array $filters = []): array
    {
        $query = PayrollRun::with(['payrollPeriod']);

        if (isset($filters['payroll_period_id'])) {
            $query->where('payroll_period_id', $filters['payroll_period_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $runs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'payroll_runs' => $runs->map(function ($run) {
                return $this->formatPayrollRun($run);
            })->all(),
            'pagination' => [
                'current_page' => $runs->currentPage(),
                'last_page' => $runs->lastPage(),
                'per_page' => $runs->perPage(),
                'total' => $runs->total(),
            ],
        ];
    }

    /**
     * Get payroll entries for a run
     *
     * @param int $runId
     * @return array<string, mixed>
     */
    public function getPayrollEntries(int $runId): array
    {
        $entries = PayrollEntry::with(['employee', 'payrollRun'])
            ->where('payroll_run_id', $runId)
            ->get();

        return [
            'payroll_entries' => $entries->map(function ($entry) {
                return $this->formatPayrollEntry($entry);
            })->all(),
        ];
    }

    /**
     * Create a payroll run and process it
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createPayrollRun(array $data): array
    {
        try {
            $payrollRun = PayrollRun::create([
                'code' => $this->generatePayrollRunCode(),
                'payroll_period_id' => $data['payroll_period_id'],
                'status' => 'draft',
            ]);

            // Process payroll for all active employees
            $this->processPayrollRun($payrollRun->id);

            return [
                'success' => true,
                'payroll_run' => $this->formatPayrollRun($payrollRun->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create payroll run: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Process payroll run - calculate all employee entries
     *
     * @param int $runId
     * @return void
     */
    public function processPayrollRun(int $runId): void
    {
        $payrollRun = PayrollRun::find($runId);
        if (!$payrollRun) {
            return;
        }

        $payrollRun->update(['status' => 'processing']);

        $period = $payrollRun->payrollPeriod;
        $employees = Employee::all();

        $totalGross = 0;
        $totalDeductions = 0;
        $totalNet = 0;

        foreach ($employees as $employee) {
            $entry = $this->calculatePayrollEntry($employee, $period, $payrollRun);
            if ($entry) {
                $totalGross += $entry['gross_pay'];
                $totalDeductions += $entry['total_deductions'];
                $totalNet += $entry['net_pay'];
            }
        }

        $payrollRun->update([
            'status' => 'draft',
            'total_gross' => $totalGross,
            'total_deductions' => $totalDeductions,
            'total_net' => $totalNet,
            'employee_count' => PayrollEntry::where('payroll_run_id', $runId)->count(),
            'processed_at' => now(),
        ]);
    }

    /**
     * Calculate payroll entry for an employee
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @param PayrollRun $run
     * @return array<string, mixed>|null
     */
    private function calculatePayrollEntry(Employee $employee, PayrollPeriod $period, PayrollRun $run): ?array
    {
        // Check if entry already exists
        $existingEntry = PayrollEntry::where('payroll_run_id', $run->id)
            ->where('employee_id', $employee->id)
            ->first();

        if ($existingEntry) {
            return null; // Skip if already calculated
        }

        // Calculate earnings
        $basicSalary = $this->calculateBasicSalary($employee, $period);
        $overtimePay = $this->calculateOvertimePay($employee, $period);
        $holidayPay = $this->calculateHolidayPay($employee, $period);
        $nightDifferential = $this->calculateNightDifferential($employee, $period);
        $allowances = $this->calculateAllowances($employee, $period);
        $bonus = $this->calculateBonus($employee, $period);
        $thirteenthMonth = $this->calculateThirteenthMonth($employee, $period);
        $otherEarnings = 0;

        $grossPay = $basicSalary + $overtimePay + $holidayPay + $nightDifferential
            + $allowances + $bonus + $thirteenthMonth + $otherEarnings;

        // Calculate deductions
        $sss = $this->calculateSSS($employee, $grossPay);
        $philHealth = $this->calculatePhilHealth($employee, $grossPay);
        $pagIbig = $this->calculatePagIbig($employee, $grossPay);
        $birTax = $this->calculateBIRTax($employee, $grossPay);
        $leaveDeductions = $this->calculateLeaveDeductions($employee, $period);
        $loans = $this->calculateLoans($employee, $period);
        $otherDeductions = 0;

        $totalDeductions = $sss + $philHealth + $pagIbig + $birTax
            + $leaveDeductions + $loans + $otherDeductions;

        $netPay = $grossPay - $totalDeductions;

        // Create payroll entry
        $entry = PayrollEntry::create([
            'code' => $this->generatePayrollEntryCode(),
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'basic_salary' => $basicSalary,
            'overtime_pay' => $overtimePay,
            'holiday_pay' => $holidayPay,
            'night_differential' => $nightDifferential,
            'allowances' => $allowances,
            'bonus' => $bonus,
            'thirteenth_month' => $thirteenthMonth,
            'other_earnings' => $otherEarnings,
            'gross_pay' => $grossPay,
            'sss_contribution' => $sss,
            'philhealth_contribution' => $philHealth,
            'pagibig_contribution' => $pagIbig,
            'bir_tax' => $birTax,
            'leave_deductions' => $leaveDeductions,
            'loans' => $loans,
            'other_deductions' => $otherDeductions,
            'total_deductions' => $totalDeductions,
            'net_pay' => $netPay,
        ]);

        return [
            'gross_pay' => $grossPay,
            'total_deductions' => $totalDeductions,
            'net_pay' => $netPay,
        ];
    }

    /**
     * Calculate basic salary (pro-rated based on days worked)
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @return float
     */
    private function calculateBasicSalary(Employee $employee, PayrollPeriod $period): float
    {
        $monthlySalary = (float) $employee->monthly_salary;
        $daysInPeriod = $period->start_date->diffInDays($period->end_date) + 1;
        $daysWorked = $this->getDaysWorked($employee, $period);

        // Pro-rate based on 22 working days per month
        $dailyRate = $monthlySalary / 22;
        return round($dailyRate * $daysWorked, 2);
    }

    /**
     * Calculate overtime pay
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @return float
     */
    private function calculateOvertimePay(Employee $employee, PayrollPeriod $period): float
    {
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('date', [$period->start_date, $period->end_date])
            ->get();

        $monthlySalary = (float) $employee->monthly_salary;
        $hourlyRate = ($monthlySalary / 22) / 8; // Daily rate / 8 hours
        $overtimeRate = $hourlyRate * 1.25; // 1.25x for overtime

        $totalOvertimeHours = $attendances->sum('overtime_hours');
        return round($overtimeRate * $totalOvertimeHours, 2);
    }

    /**
     * Calculate holiday pay
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @return float
     */
    private function calculateHolidayPay(Employee $employee, PayrollPeriod $period): float
    {
        $holidays = Holiday::whereBetween('date', [$period->start_date, $period->end_date])
            ->where('is_active', true)
            ->get();

        $monthlySalary = (float) $employee->monthly_salary;
        $dailyRate = $monthlySalary / 22;
        $totalHolidayPay = 0;

        foreach ($holidays as $holiday) {
            if ($holiday->type === 'regular') {
                // 200% of daily rate (even if not worked)
                $totalHolidayPay += $dailyRate * 2;
            } elseif ($holiday->type === 'special_non_working') {
                // 130% if worked, 0 if not worked
                $attendance = Attendance::where('employee_id', $employee->id)
                    ->where('date', $holiday->date)
                    ->first();
                if ($attendance && $attendance->status !== 'absent') {
                    $totalHolidayPay += $dailyRate * 1.3;
                }
            }
        }

        return round($totalHolidayPay, 2);
    }

    /**
     * Calculate night differential (10% for hours 10 PM - 6 AM)
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @return float
     */
    private function calculateNightDifferential(Employee $employee, PayrollPeriod $period): float
    {
        // Simplified calculation - would need actual time tracking
        $monthlySalary = (float) $employee->monthly_salary;
        $hourlyRate = ($monthlySalary / 22) / 8;
        $nightDifferentialRate = $hourlyRate * 0.10;

        // This would need actual night hours tracking
        return 0; // Placeholder
    }

    /**
     * Calculate allowances from salary components
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @return float
     */
    private function calculateAllowances(Employee $employee, PayrollPeriod $period): float
    {
        $components = SalaryComponent::where('employee_id', $employee->id)
            ->where('component_type', 'allowance')
            ->where('is_active', true)
            ->where(function ($q) use ($period) {
                $q->where('effective_from', '<=', $period->end_date)
                  ->where(function ($q2) use ($period) {
                      $q2->whereNull('effective_to')
                         ->orWhere('effective_to', '>=', $period->start_date);
                  });
            })
            ->get();

        $total = 0;
        foreach ($components as $component) {
            if ($component->calculation_type === 'fixed') {
                $total += (float) $component->amount;
            } elseif ($component->calculation_type === 'percentage') {
                $monthlySalary = (float) $employee->monthly_salary;
                $total += $monthlySalary * ((float) $component->percentage / 100);
            }
        }

        return round($total, 2);
    }

    /**
     * Calculate bonus from salary components
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @return float
     */
    private function calculateBonus(Employee $employee, PayrollPeriod $period): float
    {
        $components = SalaryComponent::where('employee_id', $employee->id)
            ->where('component_type', 'bonus')
            ->where('is_active', true)
            ->where(function ($q) use ($period) {
                $q->where('effective_from', '<=', $period->end_date)
                  ->where(function ($q2) use ($period) {
                      $q2->whereNull('effective_to')
                         ->orWhere('effective_to', '>=', $period->start_date);
                  });
            })
            ->get();

        $total = 0;
        foreach ($components as $component) {
            $total += (float) $component->amount;
        }

        return round($total, 2);
    }

    /**
     * Calculate 13th month pay (pro-rated)
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @return float
     */
    private function calculateThirteenthMonth(Employee $employee, PayrollPeriod $period): float
    {
        $monthlySalary = (float) $employee->monthly_salary;
        // 1/12 of monthly salary per month
        return round($monthlySalary / 12, 2);
    }

    /**
     * Calculate SSS contribution (4.5% capped)
     *
     * @param Employee $employee
     * @param float $grossPay
     * @return float
     */
    private function calculateSSS(Employee $employee, float $grossPay): float
    {
        $sssRate = 0.045; // 4.5%
        $maxSalaryCredit = 30000; // Example cap
        $salaryBase = min($grossPay, $maxSalaryCredit);
        return round($salaryBase * $sssRate, 2);
    }

    /**
     * Calculate PhilHealth contribution (1.5%)
     *
     * @param Employee $employee
     * @param float $grossPay
     * @return float
     */
    private function calculatePhilHealth(Employee $employee, float $grossPay): float
    {
        $philHealthRate = 0.015; // 1.5%
        return round($grossPay * $philHealthRate, 2);
    }

    /**
     * Calculate Pag-IBIG contribution (2% if >= 1500, else 1%)
     *
     * @param Employee $employee
     * @param float $grossPay
     * @return float
     */
    private function calculatePagIbig(Employee $employee, float $grossPay): float
    {
        $rate = $grossPay >= 1500 ? 0.02 : 0.01;
        return round($grossPay * $rate, 2);
    }

    /**
     * Calculate BIR withholding tax (simplified progressive tax)
     *
     * @param Employee $employee
     * @param float $grossPay
     * @return float
     */
    private function calculateBIRTax(Employee $employee, float $grossPay): float
    {
        // Simplified tax calculation - would need actual tax tables
        $annualSalary = $grossPay * 12;
        
        if ($annualSalary <= 250000) {
            return 0;
        } elseif ($annualSalary <= 400000) {
            return round(($annualSalary - 250000) * 0.20 / 12, 2);
        } elseif ($annualSalary <= 800000) {
            return round((30000 + ($annualSalary - 400000) * 0.25) / 12, 2);
        } else {
            return round((130000 + ($annualSalary - 800000) * 0.30) / 12, 2);
        }
    }

    /**
     * Calculate leave deductions (unpaid leave days)
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @return float
     */
    private function calculateLeaveDeductions(Employee $employee, PayrollPeriod $period): float
    {
        $unpaidLeaves = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereBetween('start_date', [$period->start_date, $period->end_date])
            ->get()
            ->sum('total_days');

        if ($unpaidLeaves > 0) {
            $monthlySalary = (float) $employee->monthly_salary;
            $dailyRate = $monthlySalary / 22;
            return round($dailyRate * $unpaidLeaves, 2);
        }

        return 0;
    }

    /**
     * Calculate loan deductions
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @return float
     */
    private function calculateLoans(Employee $employee, PayrollPeriod $period): float
    {
        $deductions = Deduction::where('employee_id', $employee->id)
            ->where('deduction_type', 'loan')
            ->where('is_active', true)
            ->where(function ($q) use ($period) {
                $q->where('effective_from', '<=', $period->end_date)
                  ->where(function ($q2) use ($period) {
                      $q2->whereNull('effective_to')
                         ->orWhere('effective_to', '>=', $period->start_date);
                  });
            })
            ->get();

        $total = 0;
        foreach ($deductions as $deduction) {
            if ($deduction->amount_per_period) {
                $total += (float) $deduction->amount_per_period;
            } else {
                $total += (float) $deduction->total_amount;
            }
        }

        return round($total, 2);
    }

    /**
     * Get days worked in period
     *
     * @param Employee $employee
     * @param PayrollPeriod $period
     * @return int
     */
    private function getDaysWorked(Employee $employee, PayrollPeriod $period): int
    {
        return Attendance::where('employee_id', $employee->id)
            ->whereBetween('date', [$period->start_date, $period->end_date])
            ->whereIn('status', ['present', 'late'])
            ->count();
    }

    /**
     * Generate unique payroll run code
     *
     * @return string
     */
    private function generatePayrollRunCode(): string
    {
        do {
            $code = 'PR-' . strtoupper(Str::random(8));
        } while (PayrollRun::where('code', $code)->exists());

        return $code;
    }

    /**
     * Generate unique payroll entry code
     *
     * @return string
     */
    private function generatePayrollEntryCode(): string
    {
        do {
            $code = 'PE-' . strtoupper(Str::random(8));
        } while (PayrollEntry::where('code', $code)->exists());

        return $code;
    }

    /**
     * Format payroll period for API response
     *
     * @param PayrollPeriod $period
     * @return array<string, mixed>
     */
    private function formatPayrollPeriod(PayrollPeriod $period): array
    {
        return [
            'id' => $period->id,
            'name' => $period->name,
            'start_date' => $period->start_date ? $period->start_date->format('Y-m-d') : null,
            'end_date' => $period->end_date ? $period->end_date->format('Y-m-d') : null,
            'type' => $period->type ?? 'monthly',
            'status' => $period->status ?? 'draft',
            'created_at' => $period->created_at ? $period->created_at->toDateTimeString() : null,
            'updated_at' => $period->updated_at ? $period->updated_at->toDateTimeString() : null,
        ];
    }

    /**
     * Format payroll run for API response
     *
     * @param PayrollRun $run
     * @return array<string, mixed>
     */
    private function formatPayrollRun(PayrollRun $run): array
    {
        return [
            'id' => $run->id,
            'code' => $run->code ?? '',
            'payroll_period_id' => $run->payroll_period_id,
            'payroll_period' => $run->payrollPeriod ? $this->formatPayrollPeriod($run->payrollPeriod) : null,
            'status' => $run->status ?? 'draft',
            'total_gross' => (float) ($run->total_gross ?? 0),
            'total_deductions' => (float) ($run->total_deductions ?? 0),
            'total_net' => (float) ($run->total_net ?? 0),
            'employee_count' => $run->employee_count ?? 0,
            'approved_by' => $run->approved_by,
            'approved_at' => $run->approved_at ? $run->approved_at->toDateTimeString() : null,
            'processed_at' => $run->processed_at ? $run->processed_at->toDateTimeString() : null,
            'created_at' => $run->created_at ? $run->created_at->toDateTimeString() : null,
            'updated_at' => $run->updated_at ? $run->updated_at->toDateTimeString() : null,
        ];
    }

    /**
     * Format payroll entry for API response
     *
     * @param PayrollEntry $entry
     * @return array<string, mixed>
     */
    private function formatPayrollEntry(PayrollEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'code' => $entry->code,
            'payroll_run_id' => $entry->payroll_run_id,
            'employee_id' => $entry->employee_id,
            'employee' => $entry->employee ? [
                'id' => $entry->employee->id,
                'name' => $entry->employee->first_name . ' ' . $entry->employee->last_name,
            ] : null,
            'basic_salary' => (float) $entry->basic_salary,
            'overtime_pay' => (float) $entry->overtime_pay,
            'holiday_pay' => (float) $entry->holiday_pay,
            'night_differential' => (float) $entry->night_differential,
            'allowances' => (float) $entry->allowances,
            'bonus' => (float) $entry->bonus,
            'thirteenth_month' => (float) $entry->thirteenth_month,
            'other_earnings' => (float) $entry->other_earnings,
            'gross_pay' => (float) $entry->gross_pay,
            'sss_contribution' => (float) $entry->sss_contribution,
            'philhealth_contribution' => (float) $entry->philhealth_contribution,
            'pagibig_contribution' => (float) $entry->pagibig_contribution,
            'bir_tax' => (float) $entry->bir_tax,
            'leave_deductions' => (float) $entry->leave_deductions,
            'loans' => (float) $entry->loans,
            'other_deductions' => (float) $entry->other_deductions,
            'total_deductions' => (float) $entry->total_deductions,
            'net_pay' => (float) $entry->net_pay,
            'is_approved' => $entry->is_approved,
            'created_at' => $entry->created_at,
            'updated_at' => $entry->updated_at,
        ];
    }
}

