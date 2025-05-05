<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    protected function redirectTo(Request $request): ?string
    {
        // Jika request ke API, jangan redirect
        if ($request->expectsJson() || $request->is('api/*')) {
            return null; // Ini akan mengembalikan 401 Unauthorized tanpa redirect
        }

        return route('login');
    }
}
