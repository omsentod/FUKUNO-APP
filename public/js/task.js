document.addEventListener('DOMContentLoaded', function () {
    // Fungsi untuk dropdown status di tabel
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach((dropdown, index) => {
        const button = dropdown.querySelector('.dropdown-toggle');
        const statusText = button ? button.querySelector('.status-text') : null;
        const menu = dropdown.querySelector('.dropdown-menu');

        if (!button || !statusText || !menu) {
            console.error('Dropdown elements not found for index:', index);
            return;
        }

        // Inisialisasi warna berdasarkan status awal
        const initialStatus = statusText.textContent.trim();
        if (initialStatus === 'Needs Work') {
            button.classList.add('status-needs-work');
            button.style.backgroundColor = '#ffcccc';
        }

        const items = menu.querySelectorAll('.dropdown-item');
        items.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const selectedStatus = this.getAttribute('data-status');

                if (statusText) {
                    statusText.textContent = selectedStatus;
                } else {
                    console.warn('Status text element not found, updating button text instead');
                    button.textContent = selectedStatus + ' '; // Tambah spasi untuk ikon
                }

                button.className = 'status-btn dropdown-toggle'; // Reset class
                if (selectedStatus === 'Done and Ready') {
                    button.classList.add('status-done');
                    button.style.backgroundColor = '#ccffcc';
                } else if (selectedStatus === 'Hold') {
                    button.classList.add('status-hold');
                    button.style.backgroundColor = '#ff9999';
                } else if (selectedStatus === 'In Progress') {
                    button.classList.add('status-in-progress');
                    button.style.backgroundColor = '#ffffcc';
                } else if (selectedStatus === 'Needs Work') {
                    button.classList.add('status-needs-work');
                    button.style.backgroundColor = '#ffcccc';
                }

                // Tutup dropdown setelah dipilih
                const dropdownToggle = new bootstrap.Dropdown(button);
                dropdownToggle.hide();
            });
        });
    });

   // Fungsi untuk progress checklist
   const progressDropdowns = document.querySelectorAll('.progress.dropdown-toggle');

   progressDropdowns.forEach((button, index) => {
       const dropdownMenu = button.nextElementSibling;
       const checkboxes = dropdownMenu.querySelectorAll('.progress-check');
       const progressText = button.querySelector('.progress-text');
       const doneBtn = dropdownMenu.querySelector('.done-btn');

       if (!progressText || !checkboxes.length || !doneBtn) {
           console.error('Progress elements not found for index:', index);
           return;
       }

       let totalProgress = 0;
       const progressPerCheck = 100 / checkboxes.length; // Hitung persentase per checklist
       progressText.textContent = '0%';

       checkboxes.forEach(checkbox => {
           checkbox.addEventListener('change', function () {
               totalProgress = 0;
               checkboxes.forEach(cb => {
                   if (cb.checked) {
                       totalProgress += progressPerCheck;
                   }
               });
               if (totalProgress > 100) totalProgress = 100;
               progressText.textContent = Math.round(totalProgress) + '%';

               if (totalProgress < 50) {
                   button.style.backgroundColor = '#ffcccc';
               } else if (totalProgress < 100) {
                   button.style.backgroundColor = '#ffffcc';
               } else {
                   button.style.backgroundColor = '#ccffcc';
               }
               // Tidak menutup dropdown saat checkbox diubah
           });
       });

       // Tambahkan event untuk tombol Done
       doneBtn.addEventListener('click', function () {
           const dropdownToggle = new bootstrap.Dropdown(button);
           dropdownToggle.hide(); // Tutup dropdown saat Done diklik
       });
   });
});