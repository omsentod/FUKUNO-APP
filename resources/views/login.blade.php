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
      <a href="regis.html">
        <button> Daftar</button>
      </a>
    </div>
</div>


    <!-- LOGIN FORM -->
<div class="container">
    <h1 class="login-text">LOGIN</h1>
    <div class="form-box login">
    <form action="#">
        <div class="input-box">
            <p>Username</p>
            <input type="text" placeholder="Enter your username" required>
        </div>
        <div class="input-box">
            <p>Password</p>
            <input type="password" placeholder="Enter your password" required>
        <div class="forgot-link">
            <a href="">Forgot Password?</a>
        </div>
        <button type="submit" class="btn">Masuk</button>
        </div>
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