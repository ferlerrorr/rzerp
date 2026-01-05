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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('contact_person')->nullable();
            $table->string('category');
            $table->string('email');
            $table->string('phone');
            $table->text('address');
            $table->string('tin')->nullable();
            $table->string('payment_terms')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->decimal('total_purchases', 15, 2)->default(0);
            $table->decimal('outstanding', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
