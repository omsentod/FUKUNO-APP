<?php

namespace App\Http\Controllers;

use App\Models\Checklist;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    public function index()
    {
        // Kembalikan semua data status dalam bentuk JSON
        return response()->json(Checklist::with('items')->get());
    }

// App/Http/Controllers/ChecklistController.php

public function store(Request $request)
{
    // Validasi: name (judul) wajib, items (array) opsional tapi disarankan
    $request->validate([
        'name' => 'required|string|max:255',
        'items' => 'nullable|array',
        'items.*' => 'string|max:255'
    ]);

    // 1. Buat Grup (Judul)
    $checklist = Checklist::create(['name' => $request->name]);

    // 2. Buat Item-itemnya (jika ada)
    if ($request->has('items')) {
        foreach ($request->items as $itemName) {
            if (!empty($itemName)) {
                $checklist->items()->create(['name' => $itemName]);
            }
        }
    }

    return response()->json([
        'success' => true,
        'message' => 'Checklist Group created successfully',
        'data' => $checklist->load('items') // Kirim balik beserta itemnya
    ], 201);
}

public function search(Request $request)
{
    $query = $request->input('query', '');

    $checklists = Checklist::with('items') // <--- PENTING: Muat items-nya
                      ->where('name', 'LIKE', "%{$query}%")
                      ->get();
                      
    return response()->json($checklists);
}

public function update(Request $request, $id)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'items' => 'nullable|array',
        'items.*' => 'string|max:255'
    ]);

    $checklist = Checklist::findOrFail($id);
    
    // 1. Update Nama Group
    $checklist->update(['name' => $request->name]);

    // 2. Update Items (Hapus Semua Lama -> Buat Baru)
    // Ini cara termudah untuk menangani tambah/hapus/edit sekaligus
    $checklist->items()->delete();

    if ($request->has('items')) {
        foreach ($request->items as $itemName) {
            if (!empty($itemName)) {
                $checklist->items()->create(['name' => $itemName]);
            }
        }
    }

    return response()->json([
        'success' => true,
        'message' => 'Checklist updated successfully',
        'data' => $checklist->load('items') // Kirim balik data terbaru
    ]);
}

    public function destroy($id)
    {
        $checklist = Checklist::findOrFail($id);
        $checklist->delete();

        return response()->json(['success' => true, 'message' => 'Checklist deleted successfully']);
    }
}
