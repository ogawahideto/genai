import re
import json
import os

html_file_path = 'shogi-chess-game/index.html'
temp_script_dir = 'C:\\Users\\hidet\\git\\genai\\genai \\.gemini\\tmp\\0307c9e9d638ef9e5030e2053c48534837b6ad26d2fe1baaba13c51062e113f5'
temp_script_path = os.path.join(temp_script_dir, 'temp_script.py')

with open(html_file_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

script_regex = re.compile(r'<script>([\s\S]*?)<\/script>', re.DOTALL)
match = script_regex.search(html_content)

if match:
    js_content_original = match.group(1)
    
    # Processed content for regex matching (comments removed)
    processed_js_content_for_regex = re.sub(r'//.*', '', js_content_original) # Remove single-line comments
    processed_js_content_for_regex = re.sub(r'/\*[\s\S]*?\*/', '', processed_js_content_for_regex, re.DOTALL) # Remove multi-line comments
    
    modified_js_content = js_content_original # We will modify the original content, preserving comments where not replaced by new code

    # 1. Add gameOver variable (ensure it's there and correctly positioned)
    game_state_vars_pattern = re.compile(r'(let capturedPieces = {\s*shogi: [],\s*chess: []\s*});', re.DOTALL)
    if 'let gameOver = false;' not in modified_js_content:
        modified_js_content = game_state_vars_pattern.sub(r'\1\n        let gameOver = false; // Add gameOver state', modified_js_content, 1)

    # 2. initGame: Reset gameOver state
    modified_js_content = re.sub(
        r'(useCapturedPieces = useCapturedPiecesCheckbox.checked;)',
        r'\1\n            gameOver = false; // Reset game over state',
        modified_js_content, 1
    )

    # 3. handleSquareClick: Check for gameOver
    modified_js_content = re.sub(
        r'(function handleSquareClick(row, col) {)',
        r'\1\n            if (gameOver) return; // Prevent moves if game is over',
        modified_js_content, 1
    )

    # 4. handleCapturedPieceClick: Check for gameOver and filter valid drops for check
    #    Target the line that initializes validDrops
    modified_js_content = re.sub(
        r'(const validDrops = getValidDropLocations(pieceId);)',
        r'            const validDrops = getValidDropLocations(pieceId).filter(loc => {\n                const virtualBoard = JSON.parse(JSON.stringify(boardState));\n                virtualBoard[loc.row][loc.col] = { id: pieceId, player: player };\n                return !isKingInCheck(player, virtualBoard);\n            });',
        modified_js_content, 1
    )


    # 5. movePiece: King capture game over logic
    modified_js_content = re.sub(
        r'(if (targetPiece) { # Target piece exists\n                if (targetPiece.id === \'C_KING\' || targetPiece.id === \'S_KING\') {)',
        r"""\n            if (targetPiece) { # Target piece exists\n                if (targetPiece.id === 'C_KING' || targetPiece.id === 'S_KING') {\n                    boardState[toRow][toCol] = movingPiece;\n                    boardState[fromRow][fromCol] = null;\n                    gameOver = true;\n                    messageDisplay.textContent = `${currentPlayer === 'chess' ? '\u30c1\u30a7\u30b9' : '\u5c06\u68cb'}の勝ち！`;\n                    renderBoard();\n                    return;\n                }\n                if (useCapturedPieces) {\n""", modified_js_content, 1
    )


    # 6. finalizeTurn: Check and checkmate logic (replace the existing finalizeTurn)
    finalize_turn_pattern = re.compile(
        r'function finalizeTurn() {\s*if (gameOver) return;\n\n            switchPlayer();\n            clearHighlights();\n            selectedPiece = null;\n            renderBoard();\n            renderCapturedPieces();\n\n            if (isCheckmate(currentPlayer)) {\n                gameOver = true;\n                const winner = currentPlayer === 'chess' ? '\\u30c1\\u30a7\\u30b9' : '\\u5c06\\u68cb';\n                messageDisplay.textContent = `チェックメイト！ ${winner}の勝ちです！`;\n            } else if (isKingInCheck(currentPlayer, boardState)) {\n                messageDisplay.textContent = '\\u30c1\\u30a7\\u30c3\\u30af！';\n            } else {\n                messageDisplay.textContent = '';\n            }\n        }',
        re.DOTALL
    )
    modified_js_content = finalize_turn_pattern.sub(r"""\n        function finalizeTurn() {\n            if (gameOver) return;\n\n            switchPlayer();\n            clearHighlights();\n            selectedPiece = null;\n            renderBoard();\n            renderCapturedPieces();\n\n            if (isCheckmate(currentPlayer)) {\n                gameOver = true;\n                const winner = currentPlayer === 'chess' ? '\\u30c1\\u30a7\\u30b9' : '\\u5c06\\u68cb';\n                messageDisplay.textContent = `チェックメイト！ ${winner}の勝ちです！`;\n            } else if (isKingInCheck(currentPlayer, boardState)) {\n                messageDisplay.textContent = '\\u30c1\\u30a7\\u30c3\\u30af！';\n            } else {\n                messageDisplay.textContent = '';\n            }\n        } """, modified_js_content, 1)

    # 7. getValidMoves: Split into pseudo-legal and filter for check
    get_valid_moves_pattern = re.compile(
        r'function getValidMoves(piece, row, col) {\s*const player = piece.player;\n            // まずは擬似合法手を取得\n            const pseudoLegalMoves = getPseudoLegalMoves(piece, row, col, boardState);\n\n            // 自玉が王手にならない手のみをフィルター\n            return pseudoLegalMoves.filter(move => {\n                const virtualBoard = JSON.parse(JSON.stringify(boardState));\n                // 仮想的に駒を移動\n                const originalTargetPiece = virtualBoard[move.row][move.col]; // ターゲットの駒を保存\n                virtualBoard[move.row][move.col] = virtualBoard[row][col];\n                virtualBoard[row][col] = null;\n\n                const inCheck = isKingInCheck(player, virtualBoard);\n                \n                return !inCheck;\n            });\n        }\n        \n        /**\n         * 指定された駒の擬似合法手を取得する（王手判定なし）\n         */\n        function getPseudoLegalMoves(piece, row, col, board) {\n            // boardが渡されない場合は現在のboardStateを使用\n            board = board || boardState;\n\n            const player = piece.player;\n            const dir = player === 'shogi' ? 1 : -1; // Shogi pieces move 'down' initially from 0-index perspective\n\n            switch (piece.id) {\n                case 'C_PAWN':   return getChessPawnMoves(row, col, player, dir, piece.hasMoved, board);\n                case 'C_ROOK':\n                case 'S_ROOK':   return getSlidingMoves(row, col, player, [[0, 1], [0, -1], [1, 0], [-1, 0]], board);\n                case 'C_BISHOP':\n                case 'S_BISHOP': return getSlidingMoves(row, col, player, [[1, 1], [1, -1], [-1, 1], [-1, -1]], board);\n                case 'C_KNIGHT': return getKnightMoves(row, col, player, board);\n                case 'C_QUEEN':  return getSlidingMoves(row, col, player, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]], board);\n                case 'C_KING':\n                case 'S_KING':   return getKingMoves(row, col, player, board);\n                \n                case 'S_PAWN':   return getStepMoves(row, col, player, [[dir, 0]], board);\n                case 'S_LANCE':  return getSlidingMoves(row, col, player, [[dir, 0]], board);\n                case 'S_KNIGHT': return getShogiKnightMoves(row, col, player, dir, board);\n                case 'S_SILVER': return getStepMoves(row, col, player, [[dir, 0], [dir, 1], [dir, -1], [-dir, 1], [-dir, -1]], board);\n                case 'S_GOLD':\n                case 'S_PRO_PAWN':\n                case 'S_PRO_LANCE':\n                case 'S_PRO_KNIGHT':\n                case 'S_PRO_SILVER':\n                    return getStepMoves(row, col, player, [[dir, 0], [dir, 1], [dir, -1], [0, 1], [0, -1], [-dir, 0]], board);\n\n                case 'S_PRO_ROOK': // 龍王\n                    return [\n                        ...getSlidingMoves(row, col, player, [[0, 1], [0, -1], [1, 0], [-1, 0]], board),\n                        ...getStepMoves(row, col, player, [[1, 1], [1, -1], [-1, 1], [-1, -1]], board)\n                    ];\n                case 'S_PRO_BISHOP': // 竜馬\n                    return [\n                        ...getSlidingMoves(row, col, player, [[1, 1], [1, -1], [-1, 1], [-1, -1]], board),\n                        ...getStepMoves(row, col, player, [[0, 1], [0, -1], [1, 0], [-1, 0]], board)\n                    ];\n                default: return [];\n            }\n        }',
        re.DOTALL
    )
    modified_js_content = get_valid_moves_pattern.sub(r'\n        /**\n         * 指定された駒の有効な移動先を取得する（王手にならない手のみ）\n         */\n        function getValidMoves(piece, row, col) {\n            const player = piece.player;\n            // まずは擬似合法手を取得\n            const pseudoLegalMoves = getPseudoLegalMoves(piece, row, col, boardState);\n\n            // 自玉が王手にならない手のみをフィルター\n            return pseudoLegalMoves.filter(move => {\n                const virtualBoard = JSON.parse(JSON.stringify(boardState));\n                // 仮想的に駒を移動\n                const originalTargetPiece = virtualBoard[move.row][move.col]; // ターゲットの駒を保存\n                virtualBoard[move.row][move.col] = virtualBoard[row][col];\n                virtualBoard[row][col] = null;\n\n                const inCheck = isKingInCheck(player, virtualBoard);\n                \n                return !inCheck;\n            });\n        }\n        \n        /**\n         * 指定された駒の擬似合法手を取得する（王手判定なし）\n         */\n        function getPseudoLegalMoves(piece, row, col, board) {\n            // boardが渡されない場合は現在のboardStateを使用\n            board = board || boardState;\n\n            const player = piece.player;\n            const dir = player === 'shogi' ? 1 : -1; // Shogi pieces move 'down' initially from 0-index perspective\n\n            switch (piece.id) {\n                case 'C_PAWN':   return getChessPawnMoves(row, col, player, dir, piece.hasMoved, board);\n                case 'C_ROOK':\n                case 'S_ROOK':   return getSlidingMoves(row, col, player, [[0, 1], [0, -1], [1, 0], [-1, 0]], board);\n                case 'C_BISHOP':\n                case 'S_BISHOP': return getSlidingMoves(row, col, player, [[1, 1], [1, -1], [-1, 1], [-1, -1]], board);\n                case 'C_KNIGHT': return getKnightMoves(row, col, player, board);\n                case 'C_QUEEN':  return getSlidingMoves(row, col, player, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]], board);\n                case 'C_KING':\n                case 'S_KING':   return getKingMoves(row, col, player, board);\n                \n                case 'S_PAWN':   return getStepMoves(row, col, player, [[dir, 0]], board);\n                case 'S_LANCE':  return getSlidingMoves(row, col, player, [[dir, 0]], board);\n                case 'S_KNIGHT': return getShogiKnightMoves(row, col, player, dir, board);\n                case 'S_SILVER': return getStepMoves(row, col, player, [[dir, 0], [dir, 1], [dir, -1], [-dir, 1], [-dir, -1]], board);\n                case 'S_GOLD':\n                case 'S_PRO_PAWN':\n                case 'S_PRO_LANCE':\n                case 'S_PRO_KNIGHT':\n                case 'S_PRO_SILVER':\n                    return getStepMoves(row, col, player, [[dir, 0], [dir, 1], [dir, -1], [0, 1], [0, -1], [-dir, 0]], board);\n\n                case 'S_PRO_ROOK': // 龍王\n                    return [\n                        ...getSlidingMoves(row, col, player, [[0, 1], [0, -1], [1, 0], [-1, 0]], board),\n                        ...getStepMoves(row, col, player, [[1, 1], [1, -1], [-1, 1], [-1, -1]], board)\n                    ];\n                case 'S_PRO_BISHOP': // 竜馬\n                    return [\n                        ...getSlidingMoves(row, col, player, [[1, 1], [1, -1], [-1, 1], [-1, -1]], board),\n                        ...getStepMoves(row, col, player, [[0, 1], [0, -1], [1, 0], [-1, 0]], board)\n                    ];\n                default: return [];\n            }\n        }        ', modified_js_content, 1)
    
    # 8. Add findKing, isKingInCheck, isCheckmate
    #    Find the position before "function getValidDropLocations(pieceId)" to insert
    get_valid_drop_locations_pos = re.search(r'(function getValidDropLocations(pieceId) {)', modified_js_content)
    if get_valid_drop_locations_pos:
        modified_js_content = modified_js_content[:get_valid_drop_locations_pos.start()] + """\n        // --- Check and Checkmate Logic ---\n\n        function findKing(player, board) {\n            const kingId = player === 'shogi' ? 'S_KING' : 'C_KING';\n            for (let r = 0; r < 9; r++) {\n                for (let c = 0; c < 9; c++) {\n                    const piece = board[r][c];\n                    if (piece && piece.id === kingId && piece.player === player) {\n                        return { row: r, col: c };\n                    }\n                }\n            }\n            return null; // Should not happen in a normal game if king is on board\n        }\n\n        function isKingInCheck(player, board) {\n            const kingPos = findKing(player, board);\n            if (!kingPos) return false; // King not found (game already ended or error)\n\n            const opponent = player === 'chess' ? 'shogi' : 'chess';\n            for (let r = 0; r < 9; r++) {\n                for (let c = 0; c < 9; c++) {\n                    const piece = board[r][c];\n                    if (piece && piece.player === opponent) {\n                        // Get pseudo-legal moves for opponent's piece on the given board state\n                        const moves = getPseudoLegalMoves(piece, r, c, board); // Pass the board state to helpers\n                        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {\n                            return true;\n                        }\n                    }\n                }\n            }\n            return false;\n        }\n\n        function isCheckmate(player) {\n            if (!isKingInCheck(player, boardState)) {\n                return false; // Not in check, so not checkmate\n            }\n\n            // Check if any legal move exists for any of the player's pieces\n            for (let r = 0; r < 9; r++) {\n                for (let c = 0; c < 9; c++) {\n                    const piece = boardState[r][c];\n                    if (piece && piece.player === player) {\n                        const validMoves = getValidMoves(piece, r, c); // getValidMoves already filters for check\n                        if (validMoves.length > 0) {\n                            return false; // Found a legal move to get out of check\n                        }\n                    }\n                }\n            }\n\n            // Check if dropping a captured piece can save the king\n            if (useCapturedPieces) {\n                // Get all possible drop locations, filtered by check status\n                for (const pieceId of capturedPieces[player]) {\n                    const dropLocations = getValidDropLocations(pieceId);\n                    for (const loc of dropLocations) {\n                        const virtualBoard = JSON.parse(JSON.stringify(boardState));\n                        virtualBoard[loc.row][loc.col] = { id: pieceId, player: player };\n                        if (!isKingInCheck(player, virtualBoard)) {\n                            return false; // Found a legal drop to get out of check\n                        }\n                    }\n                }\n            }\n\n            return true; // No legal moves or drops found, it's checkmate\n        }\n""" + modified_js_content[get_valid_drop_locations_pos.start():]
    else:
        print("getValidDropLocations function not found, cannot insert Checkmate Logic.")


    # 9. Update movement helpers to accept 'board' parameter
    modified_js_content = re.sub(r'(function getStepMoves(row, col, player, directions)\s*{)', r'function getStepMoves(row, col, player, directions, board) {', modified_js_content)
    modified_js_content = re.sub(r'(function getSlidingMoves(row, col, player, directions)\s*{)', r'function getSlidingMoves(row, col, player, directions, board) {', modified_js_content)
    modified_js_content = re.sub(r'(function getKnightMoves(row, col, player)\s*{)', r'function getKnightMoves(row, col, player, board) {', modified_js_content)
    modified_js_content = re.sub(r'(function getShogiKnightMoves(row, col, player, dir)\s*{)', r'function getShogiKnightMoves(row, col, player, dir, board) {', modified_js_content)
    modified_js_content = re.sub(r'(function getKingMoves(row, col, player)\s*{)', r'function getKingMoves(row, col, player, board) {', modified_js_content)
    modified_js_content = re.sub(r'(function getChessPawnMoves(row, col, player, dir, hasMoved)\s*{)', r'function getChessPawnMoves(row, col, player, dir, hasMoved, board) {', modified_js_content)
    
    # Update internal calls to boardState to use the passed 'board' parameter
    # Using specific regex for each helper function's internal boardState references
    modified_js_content = re.sub(r'(\bconst target = )boardState(\[r\]\[c\];)', r'\1board\2', modified_js_content)
    modified_js_content = re.sub(r'(\bif \(isValid\(r1, col\) \s*&&\s*!)boardState(\[r1\]\[col\]\))', r'\1board\2', modified_js_content)
    modified_js_content = re.sub(r'(\bif \(!hasMoved\) {\s*const r2 = row \+ dir \* 2;\s*if \(isValid\(r2, col\) \s*&&\s*!)boardState(\[r2\]\[col\]\))', r'\1board\2', modified_js_content)
    
    # Reconstruct the full HTML content
    new_html_content = html_content[:match.start()] + '<script>' + modified_js_content + '</script>' + html_content[match.end():]

    # Write the modified HTML back to the file
    with open(html_file_path, 'w', encoding='utf-8') as f:
        f.write(new_html_content)
else:
    print("Script tag not found in shogi-chess-game/index.html")
