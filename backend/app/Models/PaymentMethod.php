<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable as AuditingAuditable;
use OwenIt\Auditing\Contracts\Auditable;

class PaymentMethod extends Model implements Auditable
{
    use SoftDeletes, AuditingAuditable;

    protected $fillable = ['name', 'description'];

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

    public function banks()
    {
        return $this->hasMany(Bank::class, 'payment_method_id', 'id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'payment_method_id', 'id');
    }
}
