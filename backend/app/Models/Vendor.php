<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_name',
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
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_purchases' => 'decimal:2',
        'outstanding' => 'decimal:2',
    ];

    /**
     * Get invoices for this vendor
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
