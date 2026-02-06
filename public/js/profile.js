document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // 1. Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));

            // 2. Add active to clicked button
            this.classList.add('active');

            // 3. Hide all contents
            tabContents.forEach(content => content.classList.remove('active'));

            // 4. Show target content
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
});
