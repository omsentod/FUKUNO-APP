<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order - {{ $task->no_invoice }}</title>
    <link rel="stylesheet" href="{{ asset('css/print.css') }}">
    <link rel="icon" href="{{ asset('assets/img/print-logo.ico') }}" type="image/x-icon">
</head>

<body>
    <div class="po-container">
        <header>
            <img src="{{ asset('assets/img/PURCHASE-LOGO.png') }}" alt="Logo" class="header-logo-img">
            <h2>{{ $task->judul }}</h2>
        </header>

        <table class="po-details">
            <tbody>
                <tr>
                    <th>NO. PO</th>
                    <td>{{ $task->no_invoice }}</td>
                    <th>TANGGAL MULAI</th>
                    <td>{{ $task->created_at->format('j-M-Y') }}</td>
                </tr>
                <tr>
                    <th>KLIEN</th>
                    <td>{{ $task->nama_pelanggan }}</td>

                    <th>TANGGAL SELESAI</th>
                    <td>
                        {{ $projectFinishDate ? \Carbon\Carbon::parse($projectFinishDate)->format('j-M-Y') : '-' }}
                    </td>
                </tr>
                <tr>
             

                    {{-- CELL SIGNATURE (MERGED) --}}
                    <td colspan="2" rowspan="2" class="signature-cell">
                        <div class="signature-content">
                            <div class="signature-wrapper">
                                <div class="signature-spacer"></div>
                                <p class="signature-name">HEAD PRODUCTION</p>
                            </div>
                            <div class="signature-wrapper">
                                <div class="signature-spacer"></div>
                                <p class="signature-name">ADMIN</p>
                            </div>
                        </div>
                    </td>
                </tr>

                <tr>
                    <th>LINE PEKERJAAN</th>
                    <td class="line-cell">
                        <div class="line-wrapper">
                            @foreach($lineList as $item)
                                <div class="line-item">
                                    <b>{{ $item->name }}</b>
                                    <span class="line-date">({{ $item->date }})</span>
                                </div>
                            @endforeach
                        </div>
                    </td>
                </tr>


            </tbody>
        </table>

        <main class="main-content">

            {{-- BARIS 1: SPESIFIKASI & RINCIAN (Side by Side) --}}
            {{-- BARIS 1: RINCIAN (Kiri) & SPESIFIKASI + NOTE (Kanan) --}}
            <section class="row-section">

                {{-- KOLOM KIRI: RINCIAN --}}
                <div class="half-column">
                    <div class="size-table-container">
                        <h3>Rincian</h3>
                        <table class="size-table">
                            <thead class="table-danger">
                                <tr>
                                    <th>{{ $task->size_title ?? 'Size' }}</th>
                                    @foreach($tipeHeaders as $tipe)
                                        <th>{{ strtoupper($tipe) }}</th>
                                    @endforeach
                                    <th>JUMLAH</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($jenisRows as $jenis => $sizes)
                                    <tr>
                                        <td>{{ $jenis }}</td>
                                        @php $rowTotal = 0; @endphp
                                        @foreach($tipeHeaders as $tipe)
                                            @php
                                                $size = $sizes->firstWhere('tipe', $tipe);
                                                $jumlah = $size ? $size->jumlah : 0;
                                                $rowTotal += $jumlah;
                                            @endphp
                                            <td>{{ $jumlah }}</td>
                                        @endforeach
                                        <td class="row-total-print">{{ $rowTotal }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td>TOTAL</td>
                                    @foreach($tipeHeaders as $tipe)
                                        <td class="column-total-print">
                                            {{ $task->taskSizes->where('tipe', $tipe)->sum('jumlah') }}
                                        </td>
                                    @endforeach
                                    <td class="grand-total-print">{{ $task->total_jumlah }}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {{-- KOLOM KANAN: SPESIFIKASI (Atas) & NOTE (Bawah) --}}
                <div class="half-column column-stack">

                    <div class="specs-list specs-container">
                        <h3>Spesifikasi</h3>
                        <ul>
                            <li><strong>WARNA</strong>: {{ $task->warna ?? '-' }}</li>
                            <li><strong>BAHAN</strong>: {{ $task->bahan ?? '-' }}</li>
                            <li><strong>MODEL</strong>: {{ $task->model ?? '-' }}</li>
                        </ul>
                    </div>

                    <div class="notes-box notes-container">
                        <h3>Note</h3>
                        <div class="notes-content">{{ $task->catatan ?? 'Tidak ada catatan.' }}</div>
                    </div>

                </div>
            </section>

            {{-- BARIS 3: MOCKUP (FULL WIDTH) --}}
            <section class="full-width-section">
                <h3>Mockup Design</h3>
                <div class="mockup-gallery">
                    @foreach($task->mockups as $mockup)
                        <div class="mockup-item">
                            <img src="{{ Storage::url($mockup->file_path) }}" alt="Mockup Gambar">
                        </div>
                    @endforeach
                </div>
            </section>

        </main>

    </div>



    @php
        use Illuminate\Support\Facades\Storage;
        use Carbon\Carbon;
    @endphp

    <script>
        window.onload = function () {
            window.print();
        }
    </script>
</body>

</html>