<?php

namespace App\Http\Controllers;

use App\Models\Pekerjaan;
use Illuminate\Http\Request;

class PekerjaansController extends Controller
{
    public function index()
    {
        $pekerjaans = Pekerjaan::all();
        return view('work-line-sb', compact('pekerjaans'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pekerjaan' => 'required|string|max:255',
            'deadline' => 'nullable|date',
        ]);

        Pekerjaan::create($validated);

        return redirect()->route('workline')->with('success', 'Pekerjaan berhasil ditambahkan!');
    }

    public function edit($id)
    {
        $pekerjaan = Pekerjaan::findOrFail($id);
        return view('edit-pekerjaan', compact('pekerjaan'));
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama_pekerjaan' => 'required|string|max:255',
            'deadline' => 'nullable|date',
        ]);

        $pekerjaan = Pekerjaan::findOrFail($id);
        $pekerjaan->update($validated);

        return redirect()->route('workline')->with('success', 'Pekerjaan berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $pekerjaan = Pekerjaan::findOrFail($id);
        $pekerjaan->delete();
        Pekerjaan::resetIds();

        return redirect()->route('workline')->with('success', 'Pekerjaan berhasil dihapus!');
    }
}
