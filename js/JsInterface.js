
  const logoToggle = document.getElementById('logoToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  function openMenu() {
    sidebar.classList.remove('-translate-x-full');
    sidebar.classList.add('translate-x-0');
    overlay.classList.remove('hidden');
  }
  
  function closeMenu() {
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
    overlay.classList.add('hidden');
  }
  
  logoToggle.addEventListener('click', () => {
    sidebar.classList.contains('-translate-x-full') ? openMenu() : closeMenu();
  });
  
  overlay.addEventListener('click', closeMenu);
