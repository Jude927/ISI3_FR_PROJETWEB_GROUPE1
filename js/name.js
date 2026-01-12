// show-name.js
document.addEventListener('DOMContentLoaded', function() {
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.querySelectorAll('[data-user-name]').forEach(el => {
            el.textContent = userName;
        });
    }
});