<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable as AuditingAuditable;
use OwenIt\Auditing\Contracts\Auditable;

class Cart extends Model implements Auditable
{
    use SoftDeletes, AuditingAuditable;

    protected $fillable = ['user_id', 'cart_name', 'schedule'];

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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'cart_id', 'id');
    }
}
