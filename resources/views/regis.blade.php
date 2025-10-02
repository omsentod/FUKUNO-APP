<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="{{ asset('css/regis.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KyZXEJr+M7Lr19s4FgjJt0FJ93b3Vh6h90w4gJz5lD6n2zJjlHj4E0hx/9F5b93z" crossorigin="anonymous">
</head>
<body>
<!-- Header -->
<div class="head-container">
    <div class="header-logo">
        <img src="assets/img/web-logo.png" alt="header logo">
    </div>

    <div class="regis-whisp">
      <p>Sudah punya akun?</p>
      <a href="{{ route('login') }}">
        <button> Login</button>
      </a>
    </div>
</div>


    <!-- LOGIN FORM -->
<div class="container">
    <h1 class="regis-text">DAFTAR AKUN BARU</h1>
    <div class="form-box regis">
        <form action="{{ route('register.post') }}" method="POST">
            @csrf
            <div class="input-box">
                <p>Full Name</p>
                <input type="text" name="name" placeholder="Enter your username" required>
            </div>
            <div class="input-box">
                <p>Email</p>
                <input type="email" name="email" placeholder="Enter your email" required>
            </div>
            <div class="input-box">
                <p>Position</p>
                <select class="role-select" name="role" required>
                    <option value="" disabled selected>Select your position</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div class="input-box">
                <p>Password</p>
                <input type="password" name="password" placeholder="Enter your password" required>
            </div>
            <div class="input-box">
                <p>Confirm Password</p>
                <input type="password" name="password_confirmation" placeholder="Confirm your password" required>
            </div>
            <div class="submit-regis">
                <button type="submit" class="regis-btn">Daftar</button>
            </div>
        </form>
</div>
</div>

<!-- Footer -->

</body>
<script src="script.js"></script>
</html>
