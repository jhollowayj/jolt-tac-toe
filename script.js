document.addEventListener('DOMContentLoaded', () => {
    // Game constants
    const BOARD_SIZE = 4;
    const PLAYERS = [
        { id: 1, symbol: 'X', color: 'player1' },
        { id: 2, symbol: 'O', color: 'player2' },
        { id: 3, symbol: 'Δ', color: 'player3' }
    ];
    const WIN_LENGTH = 3; // Number of symbols in a row to win

    // Game state
    let gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
    let currentPlayerIndex = 0;
    let gameActive = true;
    let playerTypes = [true, true, true]; // true = human, false = computer

    // DOM elements
    const gameBoardElement = document.querySelector('.game-board');
    const currentTurnElement = document.getElementById('current-turn');
    const gameResultElement = document.getElementById('game-result');
    const resetButton = document.getElementById('reset-game');
    const playerTypeToggles = [
        document.getElementById('player1-type'),
        document.getElementById('player2-type'),
        document.getElementById('player3-type')
    ];

    // Initialize the game
    function initGame() {
        createGameBoard();
        updateGameStatus();
        setupEventListeners();
        checkComputerTurn();
    }

    // Create the game board cells
    function createGameBoard() {
        gameBoardElement.innerHTML = '';
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                gameBoardElement.appendChild(cell);
            }
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        // Cell click event
        gameBoardElement.addEventListener('click', handleCellClick);

        // Reset button event
        resetButton.addEventListener('click', resetGame);

        // Player type toggle events
        playerTypeToggles.forEach((toggle, index) => {
            toggle.addEventListener('change', () => {
                playerTypes[index] = toggle.checked;
                // If game is in progress and it's a computer's turn, trigger it
                if (gameActive) {
                    checkComputerTurn();
                }
            });
        });
    }

    // Handle cell click
    function handleCellClick(event) {
        if (!gameActive) return;

        const cell = event.target;
        if (!cell.classList.contains('cell')) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Check if cell is empty and it's a human player's turn
        if (gameBoard[row][col] === null && playerTypes[currentPlayerIndex]) {
            makeMove(row, col);
        }
    }

    // Make a move (for both human and computer players)
    function makeMove(row, col) {
        const currentPlayer = PLAYERS[currentPlayerIndex];

        // Update game board
        gameBoard[row][col] = currentPlayer.id;

        // Update UI
        updateBoardUI();

        // Check for win or tie
        if (checkWin(row, col, currentPlayer.id)) {
            endGame(`Player ${currentPlayer.id} wins!`);
            highlightWinningCells();
            return;
        }

        if (checkTie()) {
            endGame("It's a tie!");
            return;
        }

        // Next player's turn
        currentPlayerIndex = (currentPlayerIndex + 1) % PLAYERS.length;
        updateGameStatus();

        // Check if next player is computer
        checkComputerTurn();
    }

    // Update the board UI based on the game state
    function updateBoardUI() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const playerId = gameBoard[row][col];

            // Clear previous content and classes
            cell.textContent = '';
            PLAYERS.forEach(player => cell.classList.remove(player.color));

            if (playerId) {
                const player = PLAYERS.find(p => p.id === playerId);
                cell.textContent = player.symbol;
                cell.classList.add(player.color);
            }
        });
    }

    // Update game status message
    function updateGameStatus() {
        const currentPlayer = PLAYERS[currentPlayerIndex];
        currentTurnElement.textContent = `Player ${currentPlayer.id}'s turn`;
        currentTurnElement.className = 'status-message ' + currentPlayer.color;
    }

    // Check if the current move results in a win
    function checkWin(row, col, playerId) {
        // Check horizontal
        for (let c = 0; c <= BOARD_SIZE - WIN_LENGTH; c++) {
            let win = true;
            for (let i = 0; i < WIN_LENGTH; i++) {
                if (gameBoard[row][c + i] !== playerId) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }

        // Check vertical
        for (let r = 0; r <= BOARD_SIZE - WIN_LENGTH; r++) {
            let win = true;
            for (let i = 0; i < WIN_LENGTH; i++) {
                if (gameBoard[r + i][col] !== playerId) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }

        // Check diagonal (top-left to bottom-right)
        for (let r = 0; r <= BOARD_SIZE - WIN_LENGTH; r++) {
            for (let c = 0; c <= BOARD_SIZE - WIN_LENGTH; c++) {
                let win = true;
                for (let i = 0; i < WIN_LENGTH; i++) {
                    if (gameBoard[r + i][c + i] !== playerId) {
                        win = false;
                        break;
                    }
                }
                if (win) return true;
            }
        }

        // Check diagonal (top-right to bottom-left)
        for (let r = 0; r <= BOARD_SIZE - WIN_LENGTH; r++) {
            for (let c = WIN_LENGTH - 1; c < BOARD_SIZE; c++) {
                let win = true;
                for (let i = 0; i < WIN_LENGTH; i++) {
                    if (gameBoard[r + i][c - i] !== playerId) {
                        win = false;
                        break;
                    }
                }
                if (win) return true;
            }
        }

        return false;
    }

    // Check if the game is a tie
    function checkTie() {
        return gameBoard.every(row => row.every(cell => cell !== null));
    }

    // End the game
    function endGame(message) {
        gameActive = false;
        gameResultElement.textContent = message;
        currentTurnElement.textContent = '';

        // Disable all cells
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.add('disabled'));
    }

    // Highlight winning cells
    function highlightWinningCells() {
        // Find winning combination
        const playerId = PLAYERS[currentPlayerIndex].id;

        // Check horizontal wins
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c <= BOARD_SIZE - WIN_LENGTH; c++) {
                let win = true;
                for (let i = 0; i < WIN_LENGTH; i++) {
                    if (gameBoard[r][c + i] !== playerId) {
                        win = false;
                        break;
                    }
                }
                if (win) {
                    for (let i = 0; i < WIN_LENGTH; i++) {
                        highlightCell(r, c + i);
                    }
                    return;
                }
            }
        }

        // Check vertical wins
        for (let c = 0; c < BOARD_SIZE; c++) {
            for (let r = 0; r <= BOARD_SIZE - WIN_LENGTH; r++) {
                let win = true;
                for (let i = 0; i < WIN_LENGTH; i++) {
                    if (gameBoard[r + i][c] !== playerId) {
                        win = false;
                        break;
                    }
                }
                if (win) {
                    for (let i = 0; i < WIN_LENGTH; i++) {
                        highlightCell(r + i, c);
                    }
                    return;
                }
            }
        }

        // Check diagonal (top-left to bottom-right)
        for (let r = 0; r <= BOARD_SIZE - WIN_LENGTH; r++) {
            for (let c = 0; c <= BOARD_SIZE - WIN_LENGTH; c++) {
                let win = true;
                for (let i = 0; i < WIN_LENGTH; i++) {
                    if (gameBoard[r + i][c + i] !== playerId) {
                        win = false;
                        break;
                    }
                }
                if (win) {
                    for (let i = 0; i < WIN_LENGTH; i++) {
                        highlightCell(r + i, c + i);
                    }
                    return;
                }
            }
        }

        // Check diagonal (top-right to bottom-left)
        for (let r = 0; r <= BOARD_SIZE - WIN_LENGTH; r++) {
            for (let c = WIN_LENGTH - 1; c < BOARD_SIZE; c++) {
                let win = true;
                for (let i = 0; i < WIN_LENGTH; i++) {
                    if (gameBoard[r + i][c - i] !== playerId) {
                        win = false;
                        break;
                    }
                }
                if (win) {
                    for (let i = 0; i < WIN_LENGTH; i++) {
                        highlightCell(r + i, c - i);
                    }
                    return;
                }
            }
        }
    }

    // Highlight a specific cell
    function highlightCell(row, col) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            if (parseInt(cell.dataset.row) === row && parseInt(cell.dataset.col) === col) {
                cell.classList.add('winning');
            }
        });
    }

    // Reset the game
    function resetGame() {
        gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
        currentPlayerIndex = 0;
        gameActive = true;
        gameResultElement.textContent = '';

        // Reset UI
        createGameBoard();
        updateGameStatus();

        // Check if first player is computer
        checkComputerTurn();
    }

    // Check if it's a computer player's turn and make a move if it is
    function checkComputerTurn() {
        if (!gameActive) return;

        if (!playerTypes[currentPlayerIndex]) {
            // Disable board interaction during computer turn
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => cell.classList.add('disabled'));

            // Add a delay for computer move
            setTimeout(() => {
                makeComputerMove();
                // Re-enable board interaction after computer move
                if (gameActive) {
                    cells.forEach(cell => cell.classList.remove('disabled'));
                }
            }, 1000);
        }
    }

    // Computer player logic
    function makeComputerMove() {
        const currentPlayer = PLAYERS[currentPlayerIndex];
        const playerId = currentPlayer.id;

        // 1. Check for winning move
        const winningMove = findWinningMove(playerId);
        if (winningMove) {
            makeMove(winningMove.row, winningMove.col);
            return;
        }

        // 2. Check for blocking moves (for both other players)
        for (let i = 0; i < PLAYERS.length; i++) {
            if (i !== currentPlayerIndex) {
                const blockingMove = findWinningMove(PLAYERS[i].id);
                if (blockingMove) {
                    makeMove(blockingMove.row, blockingMove.col);
                    return;
                }
            }
        }

        // 3. Make a strategic move
        const strategicMove = findStrategicMove();
        makeMove(strategicMove.row, strategicMove.col);
    }

    // Find a winning move for the given player
    function findWinningMove(playerId) {
        // Try each empty cell
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (gameBoard[row][col] === null) {
                    // Temporarily place the move
                    gameBoard[row][col] = playerId;

                    // Check if this move would win
                    const isWinningMove = checkWin(row, col, playerId);

                    // Undo the move
                    gameBoard[row][col] = null;

                    if (isWinningMove) {
                        return { row, col };
                    }
                }
            }
        }

        return null;
    }

    // Find a strategic move when no winning or blocking move is available
    function findStrategicMove() {
        const emptyCells = [];

        // Collect all empty cells
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (gameBoard[row][col] === null) {
                    emptyCells.push({ row, col });
                }
            }
        }

        // Prioritize center cells
        const centerCells = emptyCells.filter(cell =>
            (cell.row === 1 || cell.row === 2) &&
            (cell.col === 1 || cell.col === 2)
        );

        if (centerCells.length > 0) {
            return centerCells[Math.floor(Math.random() * centerCells.length)];
        }

        // Otherwise, choose a random empty cell
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // Initialize the game
    initGame();
});