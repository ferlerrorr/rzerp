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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            
            // Personal Information
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->date('birth_date');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->enum('civil_status', ['single', 'married', 'divorced', 'widowed']);
            
            // Address
            $table->string('street_address');
            $table->string('city');
            $table->string('province');
            $table->string('zip_code');
            
            // Government IDs (Philippines)
            $table->string('sss_number')->unique();
            $table->string('tin')->unique();
            $table->string('phil_health_number')->unique();
            $table->string('pag_ibig_number')->unique();
            
            // Employment Details
            $table->string('department');
            $table->string('position');
            $table->string('employment_type');
            $table->date('start_date');
            $table->decimal('monthly_salary', 10, 2);
            
            // Emergency Contact
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_phone');
            $table->string('emergency_contact_relationship');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
