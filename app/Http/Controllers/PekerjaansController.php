<?php
namespace App\Http\Controllers;

use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; 


class PekerjaansController extends Controller
{
    public function index() {
        $pekerjaans = Pekerjaan::orderBy('id', 'asc')->get(); 
        return view('work-line-sb', compact('pekerjaans'));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'nama_pekerjaan' => 'required|string|max:255',
        ]);
        Pekerjaan::create($validated);
        return redirect()->route('workline')->with('success', 'Line pekerjaan ditambahkan.');
    }

    public function edit($id) {
        $pekerjaan = Pekerjaan::findOrFail($id);
        // kalau tak butuh halaman edit terpisah, kamu bisa hapus route edit ini.
        return view('edit-pekerjaan', compact('pekerjaan'));
    }

    public function update(Request $request, $id) {
        $validated = $request->validate([
            'nama_pekerjaan' => 'required|string|max:255',
        ]);
    
        $pekerjaan = Pekerjaan::findOrFail($id);
    
        $pekerjaan->update([
            'nama_pekerjaan' => $validated['nama_pekerjaan'],
        ]);
    
        return redirect()->route('workline')->with('success', 'Line pekerjaan diupdate.');
    }
    public function destroy($id)
    {
        // Mulai transaksi
        DB::beginTransaction();

        try {
            // Cari pekerjaan yang akan dihapus
            $pkj = Pekerjaan::findOrFail($id);
            $pkj->delete();  // Hapus pekerjaan

            // Menonaktifkan pengecekan foreign key (hati-hati)
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            Pekerjaan::resetIds();  // Reset ID jika perlu
            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            // Commit transaksi jika semua berjalan lancar
            DB::commit();

            return redirect()->route('workline')->with('success', 'Line pekerjaan dihapus & ID dirapikan.');
        } catch (\Exception $e) {
            // Rollback transaksi jika ada error
            DB::rollBack();

            // Menangani error jika transaksi gagal
            return redirect()->route('workline')->with('error', 'Terjadi kesalahan saat menghapus pekerjaan.');
        }
    }

    public static function resetIds()
    {
        // Ambil total baris
        $rows = self::orderBy('id')->get(['id']);
        if ($rows->isEmpty()) return;

        // Langkah 1: geser semua id ke rentang aman sementara (mis. +1_000_000)
        foreach ($rows as $row) {
            self::where('id', $row->id)->update(['id' => $row->id + 1000000]);
        }

        // Langkah 2: beri id baru mulai dari 1 sesuai urutan lama
        $newId = 1;
        foreach ($rows as $row) {
            self::where('id', $row->id + 1000000)->update(['id' => $newId++]);
        }

        // Set auto increment ke id berikutnya
        DB::statement("ALTER TABLE pekerjaans AUTO_INCREMENT = {$newId}");
    }


   public function search(Request $request)
   {
       $query = $request->input('query', ''); // Ambil kata kunci 'query'

       // ▼▼▼ GANTI 'name' MENJADI 'nama_pekerjaan' ▼▼▼
       $pekerjaan = Pekerjaan::where('nama_pekerjaan', 'LIKE', "%{$query}%") 
                         ->limit(5) // Batasi 5 hasil
                         ->get();
       // ▲▲▲ AKHIR PERBAIKAN ▲▲▲
                         
       return response()->json($pekerjaan); // Kirim sebagai JSON
   }
}