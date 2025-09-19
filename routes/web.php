<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('login');
})->name('login'); 

Route::get('/regis', function () {
    return view('regis');
})->name('regis'); 

