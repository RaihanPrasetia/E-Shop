<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable as AuditingAuditable;
use OwenIt\Auditing\Contracts\Auditable;

class ProductVariant extends Model implements Auditable
{
    use SoftDeletes, AuditingAuditable;
    protected $fillable = [
        'product_id',
        'name',
        'options'
    ];

    protected $casts = [
        'options' => 'json',
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

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
