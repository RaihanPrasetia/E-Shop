<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BankController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CartItemController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExcelController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\User\DashboardController;
use App\Http\Controllers\Api\User\ProductUserController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\AuditController;

Route::prefix('v1')->group(function () {

    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    // product
    Route::get('product', [ProductController::class, 'index']);
    Route::get('product/{id}', [ProductController::class, 'show']);

    Route::get('user-product', [ProductUserController::class, 'index']);



    Route::middleware(['auth:sanctum'])->group(function () {

        // api auth
        Route::post('profil', [AuthController::class, 'profil']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user/dashboard', [DashboardController::class, 'dashboardUser']);

        // get audit
        Route::get('audits/all', [AuditController::class, 'getAllAudits']);

        // api resources category
        Route::apiResource('category', CategoryController::class);
        Route::post('category/{id}/restore', [CategoryController::class, 'restore']);

        // api resources bank
        Route::apiResource('bank', BankController::class);

        Route::apiResource('order', OrderController::class);

        // api resources payment method
        Route::apiResource('payment-method', PaymentMethodController::class);

        // api resources user
        Route::apiResource('user', UserController::class);

        Route::apiResource('payment', PaymentController::class);

        // api product
        Route::post('product', [ProductController::class, 'store']);
        Route::post('import/product', [ExcelController::class, 'importProduct']);
        Route::post('product/{id}', [ProductController::class, 'update']);
        Route::delete('product/{id}', [ProductController::class, 'destroy']);

        // api resources cart
        Route::apiResource('cart', CartController::class);

        // api resource cart items
        Route::apiResource('cart-item', CartItemController::class);

        Route::get('/export/payments', [ExcelController::class, 'exportPayments']);
    });
});
