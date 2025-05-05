<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorizeAdmin();

        $users = User::where('role', '!=', 'admin')->latest()->get();
        return response()->json([
            'users' => $users
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Authorize admin access
            $this->authorizeAdmin();

            // Validate input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|unique:users',
                'username' => 'required|string|unique:users',
                'password' => 'required|string|min:6',
                'role' => 'required|string|in:admin,customer,management', // Restrict role values
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Handle avatar upload
            $avatarPath = null;
            if ($request->hasFile('avatar')) {
                try {
                    $avatarPath = $request->file('avatar')->store('avatars', 'public');
                } catch (\Exception $e) {
                    return response()->json([
                        'message' => 'Failed to upload avatar',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            // Create new user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['username'],
                'password' => bcrypt($validated['password']),
                'role' => $validated['role'],
                'avatar' => $avatarPath,
            ]);

            // Return success response
            return response()->json([
                'message' => 'User created successfully',
                'user' => $user
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            // Handle authorization errors
            return response()->json([
                'message' => 'Unauthorized action',
                'error' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            // Handle any other exceptions
            return response()->json([
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $this->authorizeAdmin();

        $user = User::findOrFail($id);
        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            // Authorize admin access
            $this->authorizeAdmin();

            // Find the user
            $user = User::findOrFail($id);

            // Validate input
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|string|email|unique:users,email,' . $id,
                'username' => 'sometimes|string|unique:users,username,' . $id,
                'password' => 'nullable|string|min:6',
                'role' => 'sometimes|string|in:admin,customer,management',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Handle password if provided
            if (isset($validated['password']) && !empty($validated['password'])) {
                $validated['password'] = bcrypt($validated['password']);
            } else {
                // Remove password from validated data if empty
                unset($validated['password']);
            }

            // Handle avatar upload if provided
            if ($request->hasFile('avatar')) {
                try {
                    // Delete old avatar if exists
                    if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                        Storage::disk('public')->delete($user->avatar);
                    }

                    // Store new avatar
                    $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
                } catch (\Exception $e) {
                    return response()->json([
                        'message' => 'Failed to upload avatar',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            // Update user
            $user->update($validated);

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user->fresh() // Get fresh data from database
            ], 200); // Use 200 instead of 201 for updates

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'message' => 'Unauthorized action',
                'error' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            // Authorize admin access
            $this->authorizeAdmin();

            // Find the user
            $user = User::findOrFail($id);

            // Delete user's avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Delete the user
            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'message' => 'Unauthorized action',
                'error' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Custom method to check if the user is an admin.
     */
    protected function authorizeAdmin()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            abort(403, 'Unauthorized. Only administrators can access this resource.');
        }
    }
}
