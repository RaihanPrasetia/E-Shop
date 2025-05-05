<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable as AuditingAuditable;
use OwenIt\Auditing\Contracts\Auditable;

class Category extends Model implements Auditable
{
    use SoftDeletes, AuditingAuditable;

    protected $fillable = [
        'name',
        'isActive',
        'metadata',
        'created_by'
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'metadata' => 'json',
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

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id', 'id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }
}
