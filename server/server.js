const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 4506;
const JSON_FILE_PATH = path.join(__dirname, "canvasData.json");
const connectedClients = new Map(); // Use Map instead of Set to store client information

app.use(cors());
app.use(express.static(path.join(__dirname, "../")));

let canvasData = []; // Initialize canvasData array

// Function to save canvasData to JSON file
function saveCanvasData() {
  try {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(canvasData, null, 2));
  } catch (err) {
    console.error("Error saving canvasData to JSON file:", err);
  }
}

// Function to load canvasData from JSON file
function loadCanvasData() {
  if (fs.existsSync(JSON_FILE_PATH)) {
    try {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf8");
      canvasData = JSON.parse(data);
    } catch (err) {
      console.error("Error loading canvasData from JSON file:", err);
    }
  }
}

io.on("connection", (socket) => {

  // Load the initial canvas data from the JSON file
  socket.emit("initialCanvasData", canvasData);

  socket.on("userJoined", (userUid) => {
    // Store the userUid and socket.id in the connectedClients map
    connectedClients.set(socket.id, { userUid });

  // Log the userUid when someone joins
  console.log(`User with ID ${userUid} joined the server`);
  });

  socket.on("draw", (data) => {
    // Find the index of the existing tile at the same location
    const existingIndex = canvasData.findIndex(
    (item) => item.x === data.x && item.y === data.y
  );

  if (existingIndex !== -1) {
    // If a tile exists at the same location, update its color
    canvasData[existingIndex].color = data.color;
    } else {
      // If no tile exists at the location, add the new tile data
      canvasData.push(data);
  }

  // Broadcast the drawing data to all connected users (including the sender)
  io.emit("updateCanvas", data);

  // Save the updated canvasData to the JSON file
  saveCanvasData();
  });

  socket.on("place", () => {
  socket.isPlacingEnabled = !socket.isPlacingEnabled;
  });

  socket.on("disconnect", () => {
  console.log("A user disconnected");
  });
});

// Load the canvas data from the JSON file when the server starts
loadCanvasData();

// Listen on all available network interfaces and any IP
server.listen(PORT, "0.0.0.0", () => {
console.log(`Server listening on port ${PORT}`);
});
