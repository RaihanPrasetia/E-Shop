<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable as AuditingAuditable;
use OwenIt\Auditing\Contracts\Auditable;

class Bank extends Model implements Auditable
{
    use SoftDeletes, AuditingAuditable;

    protected $fillable = [
        'name',
        'payment_method_id',
        'user_id',
        'no_rek',
        'isActive',
        'an'
    ];

    protected $casts = [
        'isActive' => 'boolean',
    ];

    protected $keyType = 'string'; // UUID adalah string
    public $incrementing = false; // Non-incremental ID
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) \Illuminate\Support\Str::uuid(); // Generate UUID
            }
        });
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
