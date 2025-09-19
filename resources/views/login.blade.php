<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
</head>
<body>
<!-- Header -->
<div class="head-container">
    <div class="header-logo">
        <img src="assets/img/web-logo.png" alt="header logo">
    </div>

    <div class="regis-whisp">
    <p>Belum punya akun?</p>
    <a href="{{ route('regis') }}">
        <button> Daftar</button>
    </a>
    </div>
</div>


    <!-- LOGIN FORM -->
<div class="container">
    <h1 class="login-text">LOGIN</h1>
    <div class="form-box login">
        <form action="{{ route('login.submit') }}" method="POST">
            @csrf
            <div class="input-box">
                <p>Email</p>
                <input type="email" name="email" placeholder="Enter your email" required>
            </div>
            <div class="input-box">
                <p>Password</p>
                <input type="password" name="password" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="btn">Masuk</button>
        </form>
</div>
</div>

<!-- Footer -->
<div class="footer-image">
    <img src="assets/img/Rectangle1.png" alt="Footer Image">
</div>

</body>
<script src="script.js"></script>
</html>
