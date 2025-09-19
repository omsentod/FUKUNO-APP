<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
</head>
<body>
    @if(session('success'))
        <div style="color: green">{{ session('success') }}</div>
    @endif

    <h1>Halo, {{ Auth::user()->name }}!</h1>
    <p>Selamat datang di dashboard 🚀</p>

    <a href="{{ route('logout') }}">Logout</a>
</body>
</html>
