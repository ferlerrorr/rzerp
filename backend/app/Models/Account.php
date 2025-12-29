<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'account_type',
        'code',
        'account_name',
        'debit',
        'credit',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    /**
     * Get journal entries where this account is the debit account
     */
    public function debitJournalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class, 'debit_account_id');
    }

    /**
     * Get journal entries where this account is the credit account
     */
    public function creditJournalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class, 'credit_account_id');
    }
}
