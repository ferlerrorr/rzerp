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
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('reference_number')->unique();
            $table->text('description');
            $table->foreignId('debit_account_id')->constrained('accounts')->onDelete('restrict');
            $table->foreignId('credit_account_id')->constrained('accounts')->onDelete('restrict');
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['Draft', 'Posted'])->default('Draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
