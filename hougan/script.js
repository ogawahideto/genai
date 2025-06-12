// script.js
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const table = gridContainer.querySelector('table');
    const inputText = document.getElementById('inputText');
    const applyTextButton = document.getElementById('applyText');
    const charCountSpan = document.getElementById('charCount');
    const maxCharsSpan = document.getElementById('maxChars');

    const ROWS = 30; // 行数
    const COLS = 50; // 列数

    let selectedCells = [];
    let isDragging = false;
    let startCell = null;

    // グリッドの生成
    function createGrid() {
        for (let i = 0; i < ROWS; i++) {
            const row = table.insertRow();
            for (let j = 0; j < COLS; j++) {
                const cell = row.insertCell();
                cell.dataset.row = i;
                cell.dataset.col = j;
            }
        }
    }

    // セル選択のロジック
    function selectCell(cell) {
        if (!selectedCells.includes(cell)) {
            selectedCells.push(cell);
            cell.classList.add('selected');
        }
    }

    function deselectAllCells() {
        selectedCells.forEach(cell => cell.classList.remove('selected'));
        selectedCells = [];
        updateCharCounts();
    }

    // ドラッグによるセル選択
    table.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'TD') {
            deselectAllCells();
            isDragging = true;
            startCell = e.target;
            selectCell(startCell);
        }
    });

    table.addEventListener('mouseover', (e) => {
        if (isDragging && e.target.tagName === 'TD') {
            const endCell = e.target;
            const startRow = parseInt(startCell.dataset.row);
            const startCol = parseInt(startCell.dataset.col);
            const endRow = parseInt(endCell.dataset.row);
            const endCol = parseInt(endCell.dataset.col);

            // ドラッグ中のセル選択をリアルタイムで更新するために一旦クリア
            deselectAllCells();

            const minRow = Math.min(startRow, endRow);
            const maxRow = Math.max(startRow, endRow);
            const minCol = Math.min(startCol, endCol);
            const maxCol = Math.max(startCol, endCol);

            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    const cell = table.rows[r].cells[c];
                    selectCell(cell);
                }
            }
            updateCharCounts();
        }
    });

    table.addEventListener('mouseup', () => {
        isDragging = false;
        startCell = null;
    });

    // ドキュメント全体でマウスアップを監視し、選択を終了
    document.addEventListener('mouseup', () => {
        isDragging = false;
        startCell = null;
    });

    // 文字数と最大入力可能文字数の更新
    function updateCharCounts() {
        charCountSpan.textContent = `文字数: ${inputText.value.length}`;
        maxCharsSpan.textContent = `最大入力可能: ${selectedCells.length}`;
    }

    inputText.addEventListener('input', updateCharCounts);

    // テキストをセルに適用
    applyTextButton.addEventListener('click', () => {
        const text = inputText.value;
        const chars = Array.from(text); // サロゲートペア対応のためArray.fromを使う

        // 選択されたセルがなければ処理しない
        if (selectedCells.length === 0) {
            alert('セルを選択してください。');
            return;
        }

        // 既存の文字をクリア
        selectedCells.forEach(cell => cell.textContent = '');

        // 文字をセルに配置
        for (let i = 0; i < selectedCells.length; i++) {
            if (i < chars.length) {
                selectedCells[i].textContent = chars[i];
            } else {
                break; // 文字がなくなったら終了
            }
        }
        inputText.value = ''; // 入力エリアをクリア
        updateCharCounts(); // カウントを更新
        deselectAllCells(); // セル選択を解除
    });

    // 初期化
    createGrid();
    updateCharCounts(); // 初期表示
});