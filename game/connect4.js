// player identifiers
var playerOne = "Red";
var playerTwo = "Yellow";
var currentPlayer = playerOne;

//game state variables
var gameOver = false;
var board;
var currentColumns;

//board dimensions
var rows = 6;
var columns = 7;

//game initializers when the page loads
window.onload = function() {
    setGame();
    resetButton();
}

//functino to start/reset the game
function setGame() {
    board = [];
    currentColumns = [5, 5, 5, 5, 5, 5, 5]; //tracker for current available row for each column

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
    if (gameOver) { //prevents any actinos to be done if the game is over
        return;
    }

    let coordinates = this.id.split("-"); //gets row and column from tile ID
    let r = parseInt(coordinates[0]);
    let c = parseInt(coordinates[1]);

    r = currentColumns[c];  //gets the current available row for the clicked column
    if (r < 0) {    //if the column is full, do nothing
        return;
    }

    //places the piece then updates the board
    board[r][c] = currentPlayer;
    let tile = document.getElementById(r.toString() + "-" + c.toString());

    tile.classList.remove("hover-highlight-red", "hover-highlight-yellow"); //removes hover highlight

    //proper colored pieces with drop animation
    if (currentPlayer == playerOne) {
        tile.classList.add("red-piece");
        currentPlayer = playerTwo;  //switches turn to player two
    } else {
        tile.classList.add("yellow-piece");
        currentPlayer = playerOne;  //switches turn to player one
    }
    tile.classList.add("falling-piece");    //drop animation

    setTimeout(() => {
        tile.classList.remove("falling-piece");
        updateTurn();   //updates the turn display
        checkWinner();  //checks for winner
    }, 1000);

    r-=1;   //updates row height for column
    currentColumns[c] = r;  //updates the current avaialble row for the column
}

//checks to see if a player has won
function checkWinner() {
    //horizontally
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r][c+1] && board[r][c+1] == board[r][c+2] && board[r][c+2] == board[r][c+3]) {
                    setWinner(r,c); //if winner is found then set the winner
                    return;
                }
            }
        }
    }

    //vertically
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 3; r++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r+1][c] && board[r+1][c] == board[r+2][c] && board[r+2][c] == board[r+3][c]) {
                    setWinner(r,c);
                    return;
                }
            }
        }
    }

    //diagonally (top left -> bottom right)
    for (let r = 3; r < rows; r++) {
        for (let c = 0; c < columns -3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r-1][c+1] && board[r-1][c+1] == board[r-2][c+2] && board[r-2][c+2] == board[r-3][c+3]) {
                    setWinner(r,c);
                    return;
                }
            }
        }
    }

    //anti diagnonally (bottom left -> top right)
    for (let r = 0; r < rows - 3; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r+1][c+1] && board[r+1][c+1] == board[r+2][c+2] && board[r+2][c+2] == board[r+3][c+3]) {
                    setWinner(r,c);
                    return;
                }
            }
        }
    }
}

//function to set/display the winner
function setWinner(r,c) {
    let winner = document.getElementById("winner");

    //if winner = playerOne -> red, else -> yellow
    let playerColor = board[r][c] === playerOne ? "red-text" : "yellow-text";
    let playerName = board[r][c] === playerOne ? "Red" : "Yellow";

    //updates the display for the winner with the proper color
    winner.innerHTML = `<span class="${playerColor}">${playerName}</span> Wins!`;

    document.getElementById("turn").innerText = ""; //removes current players turn text once game ends
    gameOver = true;
}


//function to highlight a tile whenever the mouse is hovered over it
function highlightTile() {
    if (gameOver) {
        return;
    }
    let c = parseInt(this.id.split("-")[1]);  //gets column index
    let r = currentColumns[c];

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
    let r = currentColumns[c];

    if (r>= 0) {
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        tile.classList.remove("hover-highlight-red", "hover-highlight-yellow");
    }
}

//function to update player turn display and color
function updateTurn() {
    let turnElement = document.getElementById("turn");
    let playerColor = currentPlayer === playerOne ? "red-text" : "yellow-text";
    let playerName = currentPlayer === playerOne ? "Red" : "Yellow";

    turnElement.innerHTML = `Current Player Turn: <span class="${playerColor}">${playerName}</span>`;
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
    setGame();  //re-starts the game
}