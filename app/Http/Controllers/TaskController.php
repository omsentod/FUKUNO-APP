<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class TaskController extends Controller
{

// SIMPAN FUNGSI INI
public function showPrintPage(Request $request)
{
    $data = $request->all();

 
    return view('download-task', ['data' => $data]);
}
}