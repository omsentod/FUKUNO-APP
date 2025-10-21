<?php

namespace App\Http\Controllers;

use App\Models\Checklist;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    public function index()
    {
        // Kembalikan semua data status dalam bentuk JSON
        return response()->json(Checklist::all());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $checklist = Checklist::create(['name' => $request->name]);
        return response()->json([
            'success' => true,
            'message' => 'Checklist created successfully',
            'data' => $checklist
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $checklist = Checklist::findOrFail($id);
        $checklist->update(['name' => $request->name]);

        return response()->json([
            'success' => true,
            'message' => 'Checklist updated successfully',
            'data' => $checklist
        ]);
    }

    public function destroy($id)
    {
        $checklist = Checklist::findOrFail($id);
        $checklist->delete();

        return response()->json(['success' => true, 'message' => 'Checklist deleted successfully']);
    }
}
