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
            <img src="{{ asset('assets/img/web-logo.png') }}" alt="Logo" class="header-logo-img">
            <h2>PURCHASE ORDER</h2>
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
                    <th>ARTICLE / MODEL</th>
                    <td colspan="3">{{ $task->judul }} / {{ $task->model }}</td>
                </tr>
                
                <tr>
                    <th>LINE PEKERJAAN</th>
                    <td colspan="3" style="padding: 5px 10px;">
                        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                            @foreach($lineList as $item)
                                <span style="background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 13px; border: 1px solid #ddd;">
                                    <b>{{ $item->name }}</b> 
                                    <span style="color: #000; font-size: 12px;">({{ $item->date }})</span>
                                </span>
                            @endforeach
                        </div>
                    </td>
                </tr>

                {{-- <tr>
                    <th>LINE PEKERJAAN</th>
                    <td colspan="3" style="text-transform: capitalize;">
                        {{ $lineListString ?: 'N/A' }}
                    </td>
                </tr> --}}

            </tbody>
        </table>

        <main class="main-content">
            <section class="product-info">

                <div class="specs-list">
                    <h3>Spesifikasi</h3>
                    <ul>
                        <li><strong>WARNA</strong>: {{ $task->warna ?? '-' }}</li>
                        <li><strong>BAHAN</strong> : {{ $task->bahan ?? '-' }}</li>
                        <li><strong>MODEL</strong>: {{ $task->model ?? '-' }}</li>
                    </ul>
                </div>

                @php
                $mockupCount = $task->mockups->count();
                
                $collageClass = 'mockup-collage-container';
                if ($mockupCount === 1) {
                    $collageClass .= ' image-count-1'; 
                } elseif ($mockupCount === 2) {
                    $collageClass .= ' image-count-2'; 
                }
            @endphp

            <div class="{{ $collageClass }}">
                @foreach($task->mockups as $mockup)
                    <div class="collage-item">
                        <img src="{{ Storage::url($mockup->file_path) }}" alt="Mockup Gambar">
                    </div>
                @endforeach
            </div>

                <div class="signature-area-left">
                    <div class="sign-wrapper">
                        <p class="sign-title">HEAD PRODUCTION</p>
                    </div>
                    <div class="sign-wrapper">
                        <p class="sign-title">ADMIN</p>
                    </div>
                </div>

            </section>
            
            <section class="order-details">
                 
                 <div class="size-table-container">
                    <h3>Rincian Ukuran</h3>
                    <table class="size-table">
                        <thead class="table-danger">
                            <tr>
                                <th>{{ $task->size_title ?? 'Size' }}</th>
                                @foreach($tipeHeaders as $tipe)
                                    <th>{{ strtoupper($tipe) }}</th>
                                @endforeach
                                <th>JUMLAH</th> </tr>
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

                   
                <div class="notes">
                    <h3>Note</h3>
                    {{ $task->catatan ?? 'Tidak ada catatan.' }}
                </div>
            </section>
        </main>

    </div>


    
    @php
        use Illuminate\Support\Facades\Storage;
        use Carbon\Carbon;
    @endphp

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>