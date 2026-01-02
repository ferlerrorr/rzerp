<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
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
        'email',
        'phone',
        'address',
        'tin',
        'payment_terms',
        'status',
        'total_receivables',
        'outstanding',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_receivables' => 'decimal:2',
        'outstanding' => 'decimal:2',
    ];

    /**
     * Get receivable invoices for this customer
     */
    public function receivableInvoices(): HasMany
    {
        return $this->hasMany(ReceivableInvoice::class);
    }
}
