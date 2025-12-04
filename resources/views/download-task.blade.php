<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order - {{ $task->no_invoice }}</title>
    <link rel="stylesheet" href="{{ asset('css/print.css') }}">
</head>
<body>
    <div class="po-container">
        <header>
            <h1>APPAREL BERKAH SELALU</h1>
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
                    <td>{{ $task->nama_pelanggan }}</td> @php
                        $linePekerjaan = $task->taskPekerjaans->first();
                    @endphp

                    <th>TANGGAL SELESAI</th>
                    <td>{{ $linePekerjaan && $linePekerjaan->deadline ? \Carbon\Carbon::parse($linePekerjaan->deadline)->format('j-M-Y') : '-' }}</td>
                </tr>
                <tr>
                    <th>ARTICLE / MODEL</th>
                    <td colspan="3">{{ $task->judul }} / {{ $task->model }}</td>
                </tr>
                <tr>
                    <th>LINE PEKERJAAN</th>
                    <td colspan="3">{{ $linePekerjaan ? $linePekerjaan->nama_pekerjaan : 'N/A' }}</td>
                </tr>
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

                   
                <div class="specs-list">
                    <h3>Note</h3>
                    {{ $task->catatan ?? 'Tidak ada catatan.' }}
                </div>
            </section>
        </main>
        <footer>
            <div class="signature-box">
                <div class="sign-wrapper">
                    <p class="sign-title">HEAD PRODUCTION</p>
                </div>
                <div class="sign-wrapper">
                    <p class="sign-title">VENDOR</p>
                </div>
            </div>
        </footer>
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