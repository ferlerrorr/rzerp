<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payroll_entries', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // PE-{random}
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            
            // Earnings
            $table->decimal('basic_salary', 15, 2)->default(0);
            $table->decimal('overtime_pay', 15, 2)->default(0);
            $table->decimal('holiday_pay', 15, 2)->default(0);
            $table->decimal('night_differential', 15, 2)->default(0);
            $table->decimal('allowances', 15, 2)->default(0);
            $table->decimal('bonus', 15, 2)->default(0);
            $table->decimal('thirteenth_month', 15, 2)->default(0);
            $table->decimal('other_earnings', 15, 2)->default(0);
            $table->decimal('gross_pay', 15, 2)->default(0);
            
            // Deductions
            $table->decimal('sss_contribution', 15, 2)->default(0);
            $table->decimal('philhealth_contribution', 15, 2)->default(0);
            $table->decimal('pagibig_contribution', 15, 2)->default(0);
            $table->decimal('bir_tax', 15, 2)->default(0);
            $table->decimal('leave_deductions', 15, 2)->default(0);
            $table->decimal('loans', 15, 2)->default(0);
            $table->decimal('other_deductions', 15, 2)->default(0);
            $table->decimal('total_deductions', 15, 2)->default(0);
            
            // Net Pay
            $table->decimal('net_pay', 15, 2)->default(0);
            
            $table->boolean('is_approved')->default(false);
            $table->timestamps();
            
            $table->index(['payroll_run_id', 'employee_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_entries');
    }
};
