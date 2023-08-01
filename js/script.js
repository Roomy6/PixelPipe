const canvas    = document.getElementById("canvas");
const context   = canvas.getContext("2d");
const colorMenu = document.getElementById("colorMenu");
const place     = document.getElementById("btnPlace");

let currentColor = "#3e4a56";

function drawCell(x, y) {
    context.fillStyle = currentColor;
    context.fillRect(x, y, 20, 20);
}

function setColor(color) {
    currentColor = color;
}

canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    //const cellX = Math.floor(x / 20) * 20;
    //const cellY = Math.floor(y / 20) * 20;
    drawCell(cellX, cellY);
});

place.onclick = function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cellX = Math.floor(x / 20) * 20;
    const cellY = Math.floor(y / 20) * 20;
    drawCell(cellX, cellY);
}