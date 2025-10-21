<?php

namespace App\Http\Controllers;

use App\Models\Status;
use Illuminate\Http\Request;

class StatusController extends Controller
{
    public function index()
    {
        // Kembalikan semua data status dalam bentuk JSON
        return response()->json(Status::all());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $status = Status::create(['name' => $request->name]);
        return response()->json($status, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $status = Status::findOrFail($id);
        $status->update(['name' => $request->name]);
        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => $status
        ]);
    }

    public function destroy($id)
    {
        $status = Status::findOrFail($id);
        $status->delete();
        return response()->json(['message' => 'Status deleted successfully']);
    }
}
