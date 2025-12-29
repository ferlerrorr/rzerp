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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->decimal('budgeted_amount', 15, 2);
            $table->decimal('actual_spending', 15, 2)->default(0);
            $table->string('period'); // e.g., "2024", "2024-Q1", "2024-01"
            $table->text('description')->nullable();
            $table->timestamps();
            
            // Index for filtering by period
            $table->index('period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
