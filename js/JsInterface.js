
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

  


  function toggleOptionsMenu() {
        const menu = document.getElementById('options-menu');
        menu.classList.toggle('hidden');
    }
    
    function utiliserTableau() {
        alert("Ouverture du tableau collaboratif...");
        // Ici vous ajouteriez la logique pour ouvrir le tableau
        document.getElementById('options-menu').classList.add('hidden');
    }
    
    function lancerAppel() {
        alert("Lancement de l'appel vidéo...");
        // Ici vous ajouteriez la logique pour démarrer un appel
        document.getElementById('options-menu').classList.add('hidden');
    }
    
    // Fermer le menu si on clique en dehors
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('options-menu');
        const menuButton = document.querySelector('[onclick="toggleOptionsMenu()"]');
        
        if (menu && menuButton && !menu.contains(event.target) && !menuButton.contains(event.target)) {
            menu.classList.add('hidden');
        }
    });




    
 




   

// Configuration du canvas
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');

// Variables globales
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#D59D80';
let brushSize = 3;
let lastX = 0;
let lastY = 0;
let scale = 1; // Pour le zoom
let translateX = 0;
let translateY = 0;

// Historique pour undo/redo
let history = [];
let historyStep = -1;

// Fonction pour redimensionner le canvas
function resizeCanvas() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.drawImage(tempCanvas, 0, 0);
}

// Initialisation
function initCanvas() {
    resizeCanvas();
    saveState();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('DOMContentLoaded', initCanvas);

// Sauvegarder l'état
function saveState() {
    historyStep++;
    if (historyStep < history.length) {
        history.length = historyStep;
    }
    history.push(canvas.toDataURL());
}

// Undo
function undo() {
    if (historyStep > 0) {
        historyStep--;
        const img = new Image();
        img.src = history[historyStep];
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

// Redo
function redo() {
    if (historyStep < history.length - 1) {
        historyStep++;
        const img = new Image();
        img.src = history[historyStep];
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

// ZOOM - Fonction principale
function setZoom(newScale) {
    scale = Math.max(0.5, Math.min(3, newScale)); // Entre 50% et 300%
    canvas.style.transform = `scale(${scale})`;
    canvas.style.transformOrigin = 'center center';
    
    // Mettre à jour l'affichage du zoom
    const zoomDisplay = document.getElementById('zoomLevel');
    if (zoomDisplay) {
        zoomDisplay.textContent = Math.round(scale * 100) + '%';
    }
}

// Zoom In
function zoomIn() {
    setZoom(scale + 0.1);
}

// Zoom Out
function zoomOut() {
    setZoom(scale - 0.1);
}

// Reset Zoom
function resetZoom() {
    setZoom(1);
}

// Mise à jour des boutons d'outils
function updateToolButtons(activeButton) {
    document.querySelectorAll('[id$="Tool"]').forEach(btn => {
        btn.classList.remove('active-tool');
        btn.classList.add('text-gray-500', 'dark:text-gray-400');
    });
    if (activeButton) {
        activeButton.classList.add('active-tool');
        activeButton.classList.remove('text-gray-500', 'dark:text-gray-400');
    }
}

// Outil Stylo
function activatePen() {
    currentTool = 'pen';
    const penBtn = document.getElementById('penTool');
    updateToolButtons(penBtn);
    canvas.style.cursor = 'crosshair';
}

// Outil Gomme
function activateEraser() {
    currentTool = 'eraser';
    const eraserBtn = document.getElementById('eraserTool');
    updateToolButtons(eraserBtn);
    canvas.style.cursor = 'grab';
}

// Outil Texte
function activateText() {
    currentTool = 'text';
    const textBtn = document.getElementById('textTool');
    updateToolButtons(textBtn);
    canvas.style.cursor = 'text';
}

// Changement de couleur
function changeColor(color) {
    currentColor = color;
}

// Dessin - Début
function startDrawing(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    if (currentTool === 'text') {
        showTextInput(e.clientX - rect.left, e.clientY - rect.top);
        return;
    }
    
    isDrawing = true;
    lastX = x;
    lastY = y;
}

// Dessin - Mouvement
function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    
    if (currentTool === 'pen') {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
    } else if (currentTool === 'eraser') {
        const isDark = document.documentElement.classList.contains('dark');
        ctx.strokeStyle = isDark ? '#0D1D25' : '#F8F9FA';
        ctx.lineWidth = brushSize * 4;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    lastX = x;
    lastY = y;
}

// Dessin - Fin
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveState();
    }
}

// Outil texte
let textX = 0;
let textY = 0;

function showTextInput(x, y) {
    textX = x / scale;
    textY = y / scale;
    const textArea = document.getElementById('textInputArea');
    textArea.style.left = x + 'px';
    textArea.style.top = y + 'px';
    textArea.classList.remove('hidden');
    document.getElementById('textInput').focus();
}

function addText() {
    const text = document.getElementById('textInput').value;
    if (text.trim()) {
        ctx.font = '18px Comfortaa, cursive';
        ctx.fillStyle = currentColor;
        ctx.fillText(text, textX, textY);
        saveState();
    }
    cancelText();
}

function cancelText() {
    const textArea = document.getElementById('textInputArea');
    if (textArea) {
        textArea.classList.add('hidden');
    }
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.value = '';
    }
}

// Effacer le tableau
function clearCanvas() {
    if (confirm('Êtes-vous sûr de vouloir effacer tout le tableau ?')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
    }
}

// Télécharger le tableau
function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'tableau-djangou-' + new Date().getTime() + '.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Event Listeners pour les outils
document.addEventListener('DOMContentLoaded', function() {
    // Outils
    const penTool = document.getElementById('penTool');
    if (penTool) penTool.addEventListener('click', activatePen);
    
    const eraserTool = document.getElementById('eraserTool');
    if (eraserTool) eraserTool.addEventListener('click', activateEraser);
    
    const textTool = document.getElementById('textTool');
    if (textTool) textTool.addEventListener('click', activateText);
    
    // Undo/Redo
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) undoBtn.addEventListener('click', undo);
    
    const redoBtn = document.getElementById('redoBtn');
    if (redoBtn) redoBtn.addEventListener('click', redo);
    
    // Zoom
    const zoomInBtn = document.getElementById('zoomIn');
    if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
    
    const zoomOutBtn = document.getElementById('zoomOut');
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
    
    // Canvas Events
    if (canvas) {
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Support tactile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopDrawing();
        });
    }
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelText();
        }
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                e.preventDefault();
                undo();
            }
            if (e.key === 'y') {
                e.preventDefault();
                redo();
            }
        }
    });
});

