<?php

namespace App\Exports;

use App\Models\Task;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithEvents; 
use Maatwebsite\Excel\Events\AfterSheet; 
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Style\Alignment; 
use Carbon\Carbon;

class TasksExport implements FromCollection, WithHeadings, WithMapping, WithDrawings, WithEvents
{
    protected $ids;
    protected $tasks;

    public function __construct($ids)
    {
        $this->ids = $ids;
        $this->tasks = Task::with('user', 'status', 'taskPekerjaans.checklists', 'mockups')
                   ->whereIn('id', $this->ids)
                   ->orderBy('created_at', 'desc')
                   ->get();
    }

    public function collection()
    {
        return $this->tasks;
    }

    public function headings(): array
    {
        return [
            'No. PO', 'Tasks Title', 'Jumlah', 'Line Pekerjaan', 
            'Urgent', 'Status', 'Time Left', 'Mockup', 'Klien', 'Progress (%)'
        ];
    }

    public function map($task): array
    {
        // ... (Isi fungsi map SAMA PERSIS seperti sebelumnya) ...
        // Saya singkat agar tidak kepanjangan, salin logika map Anda yang tadi di sini
        $line = $task->taskPekerjaans->first();
        $checklists = $line ? $line->checklists : collect();
        $completed = $checklists->where('is_completed', true)->count();
        $total = $checklists->count();
        $percentage = ($total > 0) ? round(($completed / $total) * 100) : 0;
        
        $timeLeftString = '-';
        $isDone = ($task->status->name == 'Done and Ready' || $task->status->name == 'Delivered' || $percentage == 100);
        if ($isDone) {
            $timeLeftString = ($task->status->name == 'Delivered') ? 'Terkirim' : 'Selesai';
        } elseif ($line && $line->deadline) {
            $timeLeftString = Carbon::parse($line->deadline)->diffForHumans();
        }

        return [
            $task->no_invoice, $task->judul, $task->total_jumlah,
            $line ? $line->nama_pekerjaan : 'N/A',
            $task->urgensi, $task->status->name, $timeLeftString,
            '', // Kosong untuk tempat gambar
            $task->nama_pelanggan, $percentage . '%'
        ];
    }

    public function drawings()
    {
        $drawings = [];

        foreach ($this->tasks as $taskIndex => $task) {
            // Loop semua mockup di task ini
            foreach ($task->mockups as $mockupIndex => $mockup) {
                
                $imagePath = storage_path('app/public/' . $mockup->file_path);

                if (file_exists($imagePath)) {
                    $drawing = new Drawing();
                    $drawing->setName('Mockup ' . ($mockupIndex + 1));
                    $drawing->setPath($imagePath);
                    $drawing->setHeight(50); // Tinggi tetap 50px
                    
                    // Koordinat tetap di baris task tersebut (Kolom H)
                    $drawing->setCoordinates('H' . ($taskIndex + 2));
                    
                    // ▼▼▼ LOGIKA GESER KE SAMPING ▼▼▼
                    // Setiap gambar digeser 55px ke kanan dari gambar sebelumnya
                    // (Lebar gambar 50px + Jarak 5px)
                    $offsetX = 5 + ($mockupIndex * 55); 
                    
                    $drawing->setOffsetX($offsetX);
                    $drawing->setOffsetY(5); // Jarak dari atas
                    // ▲▲▲ ▲▲▲ ▲▲▲
                    
                    $drawings[] = $drawing;
                }
            }
        }

        return $drawings;
    }


    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // Hitung total baris data
                $rowCount = $this->tasks->count() + 1; // +1 Header

                // Loop setiap baris data
                for ($i = 2; $i <= $rowCount; $i++) {
                    // Set tinggi baris jadi 60px (sedikit lebih besar dari gambar 50px)
                    // Supaya gambar punya ruang napas
                    $sheet->getRowDimension($i)->setRowHeight(60); 
                }

                // Atur Lebar Kolom Mockup (H) biar lega
                $sheet->getColumnDimension('H')->setWidth(40);
                // (Opsional) Rata Tengah Vertikal Semua Tulisan
                $sheet->getStyle('A1:J' . $rowCount)
                      ->getAlignment()
                      ->setVertical(Alignment::VERTICAL_CENTER);
            },
        ];
    }
}