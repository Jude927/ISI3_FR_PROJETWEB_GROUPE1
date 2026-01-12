<script>
        const canvas = document.getElementById('whiteboard');
        const ctx = canvas.getContext('2d');

        // Configuration du canvas
        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Variables
        let isDrawing = false;
        let currentTool = 'pen';
        let currentColor = '#D59D80'; // Couleur primary par défaut
        let brushSize = 3;
        let lastX = 0;
        let lastY = 0;

        // Historique pour undo/redo
        let history = [];
        let historyStep = -1;

        // Sauvegarder l'état
        function saveState() {
            historyStep++;
            if (historyStep < history.length) {
                history.length = historyStep;
            }
            history.push(canvas.toDataURL());
        }

        // Undo
        document.getElementById('undoBtn')?.addEventListener('click', () => {
            if (historyStep > 0) {
                historyStep--;
                const img = new Image();
                img.src = history[historyStep];
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
            }
        });

        // Redo
        document.getElementById('redoBtn')?.addEventListener('click', () => {
            if (historyStep < history.length - 1) {
                historyStep++;
                const img = new Image();
                img.src = history[historyStep];
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
            }
        });

        // Outils
        document.getElementById('penTool')?.addEventListener('click', function () {
            currentTool = 'pen';
            updateToolButtons(this);
            canvas.style.cursor = 'crosshair';
        });

        document.getElementById('eraserTool')?.addEventListener('click', function () {
            currentTool = 'eraser';
            updateToolButtons(this);
            canvas.style.cursor = 'grab';
        });

        document.getElementById('textTool')?.addEventListener('click', function () {
            currentTool = 'text';
            updateToolButtons(this);
            canvas.style.cursor = 'text';
        });

        function updateToolButtons(activeButton) {
            document.querySelectorAll('[id$="Tool"]').forEach(btn => {
                btn.classList.remove('active-tool');
                btn.classList.add('text-gray-500', 'hover:bg-[var(--primary-soft)]', 'hover:text-[var(--primary)]');
            });
            activeButton.classList.add('active-tool');
            activeButton.classList.remove('text-gray-500', 'hover:bg-[var(--primary-soft)]', 'hover:text-[var(--primary)]');
        }

        // Changement de couleur
        function changeColor(color) {
            currentColor = color;
            if (currentTool === 'pen') {
                canvas.style.cursor = 'crosshair';
            }
        }

        // Dessin
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Support tactile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
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

        function startDrawing(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (currentTool === 'text') {
                showTextInput(x, y);
                return;
            }

            isDrawing = true;
            lastX = x;
            lastY = y;
        }

        function draw(e) {
            if (!isDrawing) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

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
            textX = x;
            textY = y;
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
            document.getElementById('textInputArea').classList.add('hidden');
            document.getElementById('textInput').value = '';
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

        // Initialiser l'historique
        saveState();

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cancelText();
            }
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    document.getElementById('undoBtn').click();
                }
            }
        });
    </script>