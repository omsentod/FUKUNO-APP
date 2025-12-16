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
use Carbon\Carbon;

class TasksExport implements FromCollection, WithHeadings, WithMapping, WithDrawings, WithEvents
{
    protected $ids;
    protected $tasks;

    public function __construct($ids)
    {
        $this->ids = $ids;

        $this->tasks = Task::with([
            'user',
            'status',
            'taskPekerjaans',
            'mockups',
            'taskSizes',
            'comments'
        ])
        ->whereIn('id', $ids)
        ->orderBy('no_invoice')
        ->orderBy('id')
        ->get();
    }

    public function headings(): array
    {
        return [
            'No. PO',
            'Task Title',
            'Customer',
            'PIC',
            'Catatan Task',

            'Total Jumlah',
            'Warna',
            'Model',
            'Bahan',

            'Line Pekerjaan',
            'Deadline Pekerjaan',

            'Size Detail',
            'Mockup'
        ];
    }

    public function collection()
    {
        return $this->tasks;
    }

    public function map($task): array
    {
        // ============ CATATAN TASK ============
        $taskNote = ($task->catatan !== null && trim((string)$task->catatan) !== '')
            ? (string)$task->catatan
            : '-';

        // ============ LINE PEKERJAAN ============
        $linesText = $task->taskPekerjaans->pluck('nama_pekerjaan')->filter()->implode(" | ");
        if ($linesText === '') $linesText = '-';

        // ============ DEADLINE PEKERJAAN ============
        $deadlineText = $task->taskPekerjaans->map(function($l){
            return $l->deadline
                ? Carbon::parse($l->deadline)->format("Y-m-d H:i")
                : '-';
        })->implode(" | ");
        if ($deadlineText === '') $deadlineText = '-';

        // ============ SIZE DETAIL ============
        $sizeText = $task->taskSizes->groupBy('jenis')->map(function($group){
            $jenis = $group->first()->jenis ?? '';
            $items = $group->map(fn($s) => ($s->tipe ?? '') . "=" . ($s->jumlah ?? 0))->implode(", ");
            return trim($jenis) !== '' ? "{$jenis}: {$items}" : $items;
        })->filter()->implode(" | ");
        if ($sizeText === '') $sizeText = '-';

        // ============ RETURN ROW (tanpa catatan pekerjaan) ============
        return [
            $task->no_invoice,
            $task->judul,
            $task->nama_pelanggan,
            $task->user?->name ?? '-',
            $taskNote,

            $task->total_jumlah,
            $task->warna ?? '-',
            $task->model ?? '-',
            $task->bahan ?? '-',

            $linesText,
            $deadlineText,

            $sizeText,
            ''
        ];
    }

    public function drawings()
    {
        $drawings = [];
        $row = 2;

        foreach ($this->tasks as $task) {
            foreach ($task->mockups as $i => $mock) {
                $file = storage_path('app/public/' . ($mock->file_path ?? ''));
                if (!file_exists($file)) continue;

                $drawing = new Drawing();
                $drawing->setName('Mockup');
                $drawing->setPath($file);
                $drawing->setHeight(60);

                $drawing->setCoordinates('N' . $row);
                $drawing->setOffsetX($i * 65);

                $drawings[] = $drawing;
            }
            $row++;
        }

        return $drawings;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();
                $rowCount = $this->tasks->count() + 1;

                for ($i = 2; $i <= $rowCount; $i++) {
                    $sheet->getRowDimension($i)->setRowHeight(65);
                }

                // MERGE No PO
                $current = null;
                $start = 2;
                for ($row = 2; $row <= $rowCount; $row++) {
                    $po = $sheet->getCell("A{$row}")->getValue();
                    if ($current === null) {
                        $current = $po;
                        $start = $row;
                        continue;
                    }
                    if ($po != $current) {
                        if ($start < $row - 1) {
                            $sheet->mergeCells("A{$start}:A" . ($row - 1));
                        }
                        $current = $po;
                        $start = $row;
                    }
                }
                if ($start < $rowCount) {
                    $sheet->mergeCells("A{$start}:A{$rowCount}");
                }

                // Wrap teks catatan task
                $sheet->getStyle('E2:E' . $rowCount)->getAlignment()->setWrapText(true);
                $sheet->getColumnDimension('E')->setWidth(60);

                $sheet->getStyle('A1:N1')->getFont()->setBold(true);

                $sheet->getStyle('J2:J' . $rowCount)->getAlignment()->setWrapText(true);
                $sheet->getColumnDimension('J')->setWidth(30);

                $sheet->getStyle('K2:K' . $rowCount)->getAlignment()->setWrapText(true);
                $sheet->getColumnDimension('K')->setWidth(40);
            }
        ];
    }
}
