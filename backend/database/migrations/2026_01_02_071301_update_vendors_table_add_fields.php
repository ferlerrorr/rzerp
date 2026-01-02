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
        Schema::table('vendors', function (Blueprint $table) {
            // Rename name to company_name
            $table->renameColumn('name', 'company_name');
            
            // Add new columns
            $table->string('contact_person')->nullable()->after('company_name');
            $table->string('category')->after('contact_person');
            $table->string('email')->after('category');
            $table->string('phone')->after('email');
            $table->text('address')->after('phone');
            $table->string('tin')->nullable()->after('address');
            $table->string('payment_terms')->nullable()->after('tin');
            $table->enum('status', ['Active', 'Inactive'])->default('Active')->after('payment_terms');
            $table->decimal('total_purchases', 15, 2)->default(0)->after('status');
            $table->decimal('outstanding', 15, 2)->default(0)->after('total_purchases');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn([
                'contact_person',
                'category',
                'email',
                'phone',
                'address',
                'tin',
                'payment_terms',
                'status',
                'total_purchases',
                'outstanding',
            ]);
            $table->renameColumn('company_name', 'name');
        });
    }
};
