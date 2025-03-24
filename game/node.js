const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/connect4.html'));
});

let players = {};
let rows = 6;
let cols = 7;

let board = Array(rows).fill().map(() => Array(cols).fill(" "));

//checks to see if a player has won
function checkWinner() {
    //horizontally
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r][c+1] && board[r][c+1] == board[r][c+2] && board[r][c+2] == board[r][c+3]) {
                    return true;
                }
            }
        }
    }

    //vertically
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 3; r++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r+1][c] && board[r+1][c] == board[r+2][c] && board[r+2][c] == board[r+3][c]) {
                    return true;
                }
            }
        }
    }

    //diagonally (top left -> bottom right)
    for (let r = 3; r < rows; r++) {
        for (let c = 0; c < cols -3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r-1][c+1] && board[r-1][c+1] == board[r-2][c+2] && board[r-2][c+2] == board[r-3][c+3]) {
                    return true;
                }
            }
        }
    }

    //anti diagnonally (bottom left -> top right)
    for (let r = 0; r < rows - 3; r++) {
        for (let c = 0; c < cols - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r+1][c+1] && board[r+1][c+1] == board[r+2][c+2] && board[r+2][c+2] == board[r+3][c+3]) {
                    return true;
                }
            }
        }
    }
}

//tracks when players connect
io.on('connection', (socket) => {
    console.log("Client '" + socket.id + "' connected");

    if (Object.keys(players).length < 2) {
        const playerColor = Object.keys(players).length === 0 ? "red" : "yellow";
        players[socket.id] = playerColor;
        socket.emit("playerAssigned", playerColor);
    } else {
        socket.emit("gameFull");
        socket.disconnect();
        return;
    }

    io.emit("updateGame", { board, currentPlayer: players[socket.id] });

    socket.on("dropPiece", ({ col }) => {
        console.log("Piece dropped in column:", col);

        let row = -1;
        for (let r = 5; r >= 0; r--) {
            if (board[r][col] === " ") {
                row = r;
                break;
            }
        }

        if (row === -1)
            return;

        board[row][col] = players[socket.id];

        io.emit("updateGame", { board, row, col, currentPlayer: players[socket.id] });

        if (checkWinner()) {
            io.emit("gameOver", {winner: players[socket.id]});
            return;
        }

    });

    //tracks when players leave
    socket.on('disconnect', () => {
        console.log("Client '" + socket.id + "' disconnected");
        delete players[socket.id];
        if (Object.keys(players).length === 0) {
            board = Array(row).fill().map(() => Array(col).fill(" "));
        }
        io.emit("playerLeft");
    });

    socket.on('resetGame', () => {
        board = Array(rows).fill().map(() => Array(cols).fill(" "));
    });
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});