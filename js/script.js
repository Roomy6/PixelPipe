const socket = io.connect("http://localhost:4506/");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const colorMenu = document.getElementById("colorMenu");
const btnPlace = document.getElementById("btnPlace");

const tileSize = 10;
let currentZoom = 1.0;
let currentColor = "#3e4a56";
let selectedTile = null;
let selectedColor = null;
let selectedCell = null;

function drawCell(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x, y, tileSize, tileSize);
    context.strokeStyle = "black";
}

function setColor(color, tile) {
    currentColor = color;
    if (selectedTile) {
    selectedTile.style.border = "none";
    }
    selectedTile = tile;
    selectedColor = color;
    selectedTile.style.border = "2px solid #616161";
}

const colorTiles = document.querySelectorAll(".colorTile");
colorTiles.forEach((tile) => {
        tile.addEventListener("click", function () {
        const color = tile.style.backgroundColor;
        setColor(color, tile);
    });
});

btnPlace.onclick = function () {
  if (selectedColor && selectedCell) {
        const cellX = selectedCell.x;
        const cellY = selectedCell.y;
        drawCell(cellX * tileSize, cellY * tileSize, selectedColor);
        const data = { x: cellX, y: cellY, color: selectedColor };
        socket.emit("draw", data);
    }
};

canvas.addEventListener("click", function (event) {
if (selectedColor) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cellX = Math.floor(x / (tileSize * currentZoom)); // Unscale x-coordinate based on grid size and zoom
    const cellY = Math.floor(y / (tileSize * currentZoom)); // Unscale y-coordinate based on grid size and zoom
    selectedCell = { x: cellX, y: cellY };
    if (socket.isPlacingEnabled) {
        const data = { x: cellX, y: cellY, color: selectedColor };
        socket.emit("draw", data);
    }}
});

socket.on("updateCanvas", (data) => {
    const { x, y, color } = data;
    const scaledX = x * tileSize * currentZoom; // Scale x-coordinate based on grid size and zoom
    const scaledY = y * tileSize * currentZoom; // Scale y-coordinate based on grid size and zoom
    drawCell(scaledX, scaledY, color);
});

socket.on("initialCanvasData", (data) => {
    // Clear the canvas before drawing the initial canvas data
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw the entire canvas using the received data
    data.forEach((item) => {
        const { x, y, color } = item;
        const scaledX = x * tileSize * currentZoom;
        const scaledY = y * tileSize * currentZoom;
        drawCell(scaledX, scaledY, color);
    });
});

// Function to generate a secure random string
function generateRandomString(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
  
    for (let i = 0; i < length; i++) {
      randomString += charset[randomValues[i] % charset.length];
    }
  
    return randomString;
  }
  
  // Function to set a unique and secure cookie
  function setUniqueSecureCookie(name, value, daysToExpire) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToExpire);
    const cookieValue = encodeURIComponent(value) + '; expires=' + expirationDate.toUTCString() + '; path=/; Secure';
  
    // consider using the "HttpOnly" flag to improve security
    // cookieValue += '; HttpOnly';
  
    document.cookie = name + '=' + cookieValue;
  }
  
  // Usage: Generate a unique cookie and set it with a 30-day expiration
  const uniqueId = generateRandomString(32); // 32 characters long
  setUniqueSecureCookie('user_uid', uniqueId, 30);

// Function to get the value of a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Get the unique user ID from the cookie
const userUid = getCookie('user_uid');

socket.emit('userJoined', userUid);