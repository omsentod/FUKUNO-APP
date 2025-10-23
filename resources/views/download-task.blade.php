<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order - {{ $data['noPo'] ?? 'N/A' }}</title>
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
                    <td>{{ $data['noPo'] ?? 'N/A' }}</td>
                    <th>TANGGAL MULAI</th>
                    <td>{{ $data['tanggalMulai'] ?? date('j-M-Y') }}</td>
                </tr>
                <tr>
                    <th>KLIEN</th>
                    <td>{{ $data['klien'] ?? '-' }}</td>
                    <th>TANGGAL SELESAI</th>
                    <td>{{ $data['tanggalSelesai'] ?? '-' }}</td>
                </tr>
                <tr>
                    <th>ARTICLE / MODEL</th>
                    <td colspan="3">{{ $data['taskTitle'] ?? '-' }}</td>
                </tr>
                <tr>
                    <th>MATERIAL</th>
                    <td colspan="3">{{ $data['material'] ?? '-' }}</td>
                </tr>
            </tbody>
        </table>

        <main class="main-content">
            <section class="product-info">
                 <img src="{{ $data['mockupSrc'] ?? '' }}" alt="Mockup" class="product-image">
                 <div class="signature-box">
                    <p class="sign">HEAD PRODUCTION</p>
                    <p class="sign">Vendor</p>
                </div>
            </section>
            
            <section class="order-details">
                <div class="specs-list">
                    <h3>Spesifikasi</h3>
                    <ul>
                        <li><strong>WARNA</strong>: Hitam</li>
                        <li><strong>PRINTING</strong>: Sublim</li>
                        <li><strong>BORDIR</strong>: -</li>
                    </ul>
                </div>
                <div class="specs-list">
                    <h3>Note</h3>
                    
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ab provident odio earum quaerat nostrum officia.                    
                </div>
                 <div class="size-table-container">
                    <h3>Rincian Ukuran</h3>
                    <table class="size-table">
                        <thead>
                            <tr>
                                <th>SIZES</th>
                                <th>PENDEK</th>
                                <th>PANJANG</th>
                                <th>JUMLAH</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>XS</td>
                                <td>0</td>
                                <td>1</td>
                                <td>1</td>
                            </tr>
                            <tr>
                                <td>S</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                            <tr>
                                <td>M</td>
                                <td>0</td>
                                <td>1</td>
                                <td>1</td>
                            </tr>
                            <tr>
                                <td>L</td>
                                <td>0</td>
                                <td>1</td>
                                <td>1</td>
                            </tr>
                            <tr>
                                <td>XL</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                            <tr>
                                <td>2XL - 7XL</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td>TOTAL</td>
                                <td>{{ $data['jumlah'] ?? '-' }}</td>
                                <td>{{ $data['jumlah'] ?? '-' }}</td>
                                <td>{{ $data['jumlah'] ?? '-' }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </section>
        </main>
    </div>
    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>