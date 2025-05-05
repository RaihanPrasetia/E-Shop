<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use App\Models\User;
use OwenIt\Auditing\Models\Audit;

class AuditController extends Controller
{
    public function getAllAudits(Request $request)
    {
        $modelParam = $request->query('model');
        $modelClass = $this->getModelClassFromParam($modelParam);

        $query = Audit::query();

        if ($modelParam) {
            if (!$modelClass) {
                return response()->json([
                    'message' => 'Model tidak valid',
                ], 422);
            }

            $query->where('auditable_type', $modelClass);
        }

        $audits = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($audit) {
                $user = $audit->user_id ? User::find($audit->user_id) : null;

                return [
                    'id' => $audit->id,
                    'user_id' => $audit->user_id,
                    'event' => $audit->event,
                    'auditable_id' => $audit->auditable_id,
                    'auditable_type' => $audit->auditable_type,
                    'old_values' => $audit->old_values,
                    'new_values' => $audit->new_values,
                    'url' => $audit->url,
                    'ip_address' => $audit->ip_address,
                    'user_agent' => $audit->user_agent,
                    'tags' => $audit->tags,
                    'created_at' => $audit->created_at,
                    'updated_at' => $audit->updated_at,
                    'user' => $user ? [
                        'name' => $user->name,
                        'role' => $user->role,
                    ] : null,
                ];
            });

        return response()->json([
            'message' => 'Audit history',
            'audits' => $audits,
        ], 200);
    }

    /**
     * Convert request model param to fully qualified model class name.
     *
     * @param string|null $model
     * @return string|null
     */
    private function getModelClassFromParam(?string $model): ?string
    {
        $map = [
            'category' => Category::class,
            'bank' => Bank::class,
            'payment' => Payment::class,
            'product' => Product::class,
            'order' => Order::class,
            'user' => User::class,
            'cart' => Cart::class,
            'variant' => ProductVariant::class,
            // tambahkan model lain sesuai kebutuhan
        ];

        return $model && isset($map[strtolower($model)]) ? $map[strtolower($model)] : null;
    }
}
