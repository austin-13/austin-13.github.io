var socket = io(); //connects to the node.js server

socket.emit("joinGame");    //when connected requests to join the game

var playerColor = null; //players color assigned by server

// player identifiers
var playerOne = "red";
var playerTwo = "yellow";
var currentPlayer = playerOne;

//game state variables
var gameOver = false;
var board;

//board dimensions
var rows = 6;
var columns = 7;


socket.on("playerAssigned", (color) => {
    playerColor = color;
    console.log("You are: " + playerColor);
    updateTurn();   //updates the UI based on the color assigned
})

socket.on("gameFull", () => {
    alert("Game is full. Try again later.");
    window.location.reload(); // Refresh the page if game is full
});

socket.on("updateGame", (gameData) => {
    let {board: updatedBoard, row, col, currentPlayer: updatedPlayer} = gameData;
    board = updatedBoard;

    if (row >= 0 && col >= 0) {
        let tile = document.getElementById(row.toString() + "-" + col.toString());
        tile.classList.remove("hover-highlight-red", "hover-highlight-yellow");

        if (updatedPlayer === "red") {
            tile.classList.add("red-piece");
        } else {
            tile.classList.add("yellow-piece");
        }
        tile.classList.add("falling-piece");    //drop animation
        
        setTimeout(() => {
            tile.classList.remove("falling-piece");
            updateTurn();   //updates the turn display
        }, 1000);
    }

    currentPlayer = updatedPlayer === "red" ? "yellow" : "red";
    updateTurn();
});

socket.on("gameOver", (winnerData) => {
    let winnerElement = document.getElementById("winner");
    winnerElement.innerHTML = `<span class="${winnerData.winner === "red" ? "red-text" : "yellow-text"}">${winnerData.winner}</span> Wins!`;
    gameOver = true;
   // resetGame();
});

socket.on("resetGame", () => {
    gameOver = false;
    currentPlayer = "red";
    document.getElementById("winner").innerText = "";
    setGame();
});

//game initializers when the page loads
window.onload = function() {
    setGame();
    resetButton();
}

//functino to start/reset the game
function setGame() {
    board = [];

    //clears board on reset
    document.getElementById("board").innerHTML = "";

    //creates the game board grid and attaches event listeners
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            row.push(' ');  //starts the board with empty spaces

            //creates the HTML for the board
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString(); //unique ID based on either row and column
            tile.classList.add("tile");
            
            //event listeners for any tile/piece interactions
            tile.addEventListener("click", setPiece);
            tile.addEventListener("mouseover", highlightTile);
            tile.addEventListener("mouseleave", removeHighlight);
            document.getElementById("board").append(tile);  //adds the tiles to the board
        }
        board.push(row);
    }
    updateTurn();   //updates the turn display (playerOne(red)/playerTwo(yellow))
}

//function to set a piece on the board when clicked
function setPiece() {
    if (gameOver || playerColor !== currentPlayer) { //prevents any actions to be done if the game is over
        return;
    }

    let coordinates = this.id.split("-"); //gets row and column from tile ID
    let r = parseInt(coordinates[0]);
    let c = parseInt(coordinates[1]);
    socket.emit("dropPiece", { row: r, col: c });    //emits the move to the server
}

//function to set/display the winner
function setWinner(r,c) {
    let winner = document.getElementById("winner");

    //if winner = playerOne -> red, else -> yellow
    let playerColor = board[r][c] === playerOne ? "red-text" : "yellow-text";
    let playerName = board[r][c] === playerOne ? "red" : "yellow";

    //updates the display for the winner with the proper color
    winner.innerHTML = `<span class="${playerColor}">${playerName}</span> Wins!`;

    document.getElementById("turn").innerText = ""; //removes current players turn text once game ends
    gameOver = true;
}


//highlights only available index on board
function getLowestEmptyRow(board, col) {
    for (let row = board.length - 1; row >= 0; row--) {
        if (board[row][col] === " ") {
            return row;
        }
    }
    return -1;
}

//function to highlight a tile whenever the mouse is hovered over it
function highlightTile() {
    if (gameOver) {
        return;
    }
    let c = parseInt(this.id.split("-")[1]);  //gets column index
    let r = getLowestEmptyRow(board, c);

    if (r >= 0) {
        let tile = document.getElementById(r.toString() + "-" + c.toString());

        //removes any previous hover highlights
        tile.classList.remove("hover-highlight-red", "hover-highlight-yellow");

        //adds the hover highlight depending on the current player
        if (currentPlayer === playerOne) {
            tile.classList.add("hover-highlight-red");
        } else {
            tile.classList.add("hover-highlight-yellow");
        }
    }
}


//function to remove the hover highlight whenever the mouse leaves the tile
function removeHighlight() {
    let c = parseInt(this.id.split("-")[1]);
    let r = getLowestEmptyRow(board, c);

    if (r >= 0) {
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        tile.classList.remove("hover-highlight-red", "hover-highlight-yellow");
    }
}

//function to update player turn display and color
function updateTurn() {
    let turnElement = document.getElementById("turn");
    let playerColorStyle = `${currentPlayer}-text`;
    let playerName = currentPlayer;

    turnElement.innerHTML = `Current Player Turn: <span class="${playerColorStyle}">${playerName}</span>`;
}

//function to create and display the reset button
function resetButton() {
    if (!document.getElementById("resetButton")) {  //checks if button is already created, so no duplicates
        let resetButton = document.createElement("button");
        resetButton.innerText = "New Game";
        resetButton.id = "resetButton";
        resetButton.classList.add("reset-button");
        resetButton.addEventListener("click", resetGame);

        document.body.appendChild(resetButton); //appends the reset button to the page
    }
}

//function to reset the game to its starting state
function resetGame() {
    gameOver = false;
    currentPlayer = playerOne;
    document.getElementById("winner").innerText = "";   //clears the winner text
    socket.emit("resetGame");
    setGame();  //re-starts the game
}