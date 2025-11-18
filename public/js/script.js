document.addEventListener('DOMContentLoaded', function() {

// 1. Cari elemen flash message
const flashMessage = document.getElementById('flashMessage');
    
if (flashMessage) {
    // Tunggu 1 detik (1000 milidetik)
    setTimeout(() => {
        
        // 3. Tambahkan class 'fade-out' untuk memicu animasi keluar
        flashMessage.classList.add('fade-out');

        // 4. Hapus elemen dari DOM setelah animasi (1s) selesai
        setTimeout(() => {
            if (flashMessage.parentNode) { 
                flashMessage.parentNode.removeChild(flashMessage);
            }
        }, 1000); // 1000ms = 1s (Durasi animasi)

    }, 1000); // <-- GANTI MENJADI 1000 (1 detik)
}

});