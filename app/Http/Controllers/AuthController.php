<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // REGISTER
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|in:user,admin',
            'password' => 'required|string|min:3|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        // Buat token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return redirect()->route('login')->with('success', 'User registered successfully');
    }

    // LOGIN
    public function login(Request $request)
    {
        // validasi input
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // cek user berdasarkan email
        $user = User::where('email', $request->email)->first();

        // cek user & password
        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->with('error', 'Email atau password salah!');
        }

        // login manual ke session Laravel
        Auth::login($user);
        $request->session()->regenerate();

        // buat token sanctum (kalau butuh API access)
        $token = $user->createToken('auth_token')->plainTextToken;

        // redirect ke dashboard
        return redirect()->route('dashboard')->with('success', 'Login successful');
    }

    // LOGOUT
    public function logout(Request $request)
    {
        // Hapus semua token Sanctum milik user
        $request->user()->tokens()->delete();

        // Logout dari session Laravel
        Auth::logout();

        // Invalidate session yang ada
        $request->session()->invalidate();

        // Regenerate CSRF token untuk keamanan
        $request->session()->regenerateToken();

        // Redirect ke halaman login dengan pesan sukses
        return redirect()->route('login')->with('success', 'Logout berhasil');
    }

}
