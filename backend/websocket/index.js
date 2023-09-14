const WebSocket = require("ws");
const axios = require("axios");
const crypto = require("crypto");

// Constants
const PING_TIME = 30000;
const connectedClients = [];
const rooms = {};

// Utility Functions
const getUserID = async (token) => {
  try {
    const response = await axios.post("http://10.100.102.2:81/get_userid", {
      cookie: token,
    });

    if (response.data.success) {
      const user_id = response.data.user_id;
      return user_id;
    } else {
      console.log("Invalid token");
      return null;
    }
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};
function generateRandomNumber() {
  const serverSeed = crypto.randomBytes(32).toString("hex");
  const number = parseInt(
    crypto.createHash("sha256").update(serverSeed).digest("hex").charAt(37),
    16
  );
  return number;
}
const createRoom = async (room_id, ownerclient, infojson) => {
  console.log(`Creating room: ${room_id}`);
  if (rooms.hasOwnProperty(room_id)) {
    return; // Room already exists
  }

  try {
    const user_id = await getUserID(ownerclient.token);
    const { betAmount, starterColor, ownerheadshop } = JSON.parse(infojson);

    rooms[room_id] = {
      ownerId: user_id,
      decidedSide: betAmount,
      startColor: starterColor,
      roomId: room_id,
      ownerheadshop: ownerheadshop,
      players: [user_id],
    };

    console.log(`Room ${JSON.stringify(rooms[room_id])} created`);
    connectedClients.forEach((client) => {
      if (client.websocket.readyState === WebSocket.OPEN) {
        client.websocket.send(
          `69/gamecreated${JSON.stringify(rooms[room_id])}`
        );
        rooms[room_id] = rooms[room_id];
      }
    });
  } catch (error) {
    console.error("Error creating room:", error);
  }
};

const joinRoom = async (room_id, client) => {
  if (rooms.hasOwnProperty(room_id) && client.authenticated) {
    try {
      const userid = await getUserID(client.token);
      if (rooms[room_id].ownerId === userid) {
        if (!rooms[room_id].players || rooms[room_id].players.length < 2) {
          rooms[room_id].players = rooms[room_id].players || [];
          if (!rooms[room_id].players.includes(userid)) {
            rooms[room_id].players.push(userid);
            broadcastRoomInfo(room_id);
          }
        }
      } else if (!rooms[room_id].players || rooms[room_id].players.length < 2) {
        if (!rooms[room_id].players.includes(userid)) {
          rooms[room_id].players.push(userid);
          broadcastRoomInfo(room_id, userid);
        }
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  }
};
function isEven(number) {
  if (number % 2 === 0) {
    return 0.6;
  }
  return 0.1;
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const broadcastRoomInfo = async (room_id, userid) => {
  rooms[room_id].name = isEven(generateRandomNumber());
  const roomToDelete = rooms[room_id]; // Store a reference to the room before deleting
  delete rooms[room_id]; // Delete the room from the object
  console.log(rooms[room_id]);
  // Broadcast room info
  connectedClients.forEach((client) => {
    client.websocket.send(`69/roominfo${JSON.stringify(roomToDelete)}`);
  });
  await delay(5000);

  // Notify clients about room removal
  connectedClients.forEach((client) => {
    client.websocket.send(`69/remove${room_id}`);
  });
};

const authenticateClient = (client, auth_key) => {
  return true; // Implement your authentication logic here
};

// WebSocket Handling
const handleAuthenticatedWebSocketMessage = (websocket, message, client) => {
  if (message.startsWith("69/create")) {
    const room_id = Math.floor(Math.random() * 90000) + 10000;
    createRoom(room_id, client, message.replace("69/create", ""));
    return;
  }

  if (message.startsWith("69/join")) {
    const room_id = message.split("69/join")[1];
    joinRoom(room_id, client);
    return;
  }
};

const handleWebSocketMessage = (websocket, message) => {
  const client = getClientByWebSocket(websocket);
  if (!client) {
    websocket.terminate();
    return;
  }

  message = message.toString();
  if (message != "5") {
    console.log(message);
  }
  if (message === "5") {
    clearTimeout(client.pingTimeout);
    client.pinged = true;
    return;
  }
  if (message.startsWith("69/auth") && !client.authenticated) {
    const auth_key = message.split('"')[1];
    if (authenticateClient(client, auth_key)) {
      client.authenticated = true;
      client.token = auth_key;
    }
  } else if (client.authenticated) {
    handleAuthenticatedWebSocketMessage(websocket, message, client);
  } else {
    websocket.terminate();
  }
};

const getClientByWebSocket = (websocket) => {
  return connectedClients.find((client) => client.websocket === websocket);
};

const handleWebSocketConnection = (websocket) => {
  const client = {
    websocket,
    authenticated: false,
    pinged: false,
    pingTimeout: null,
  };
  connectedClients.push(client);
  websocket.send(`69/loadoldgames ${JSON.stringify(rooms)}`);
  const sendPing = () => {
    const pingMessage = "3";

    const pingInterval = setInterval(() => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(pingMessage);
      }
    }, PING_TIME);

    client.pingTimeout = setTimeout(() => {
      clearInterval(pingInterval);
      if (!client.pinged) {
        websocket.terminate();
      } else {
        client.pinged = false;
        sendPing();
      }
    }, PING_TIME * 3);
  };

  sendPing();

  websocket.on("message", (message) => {
    handleWebSocketMessage(websocket, message);
  });

  websocket.on("close", () => {
    connectedClients.splice(connectedClients.indexOf(client), 1);
    clearTimeout(client.pingTimeout);
  });
};

const wss = new WebSocket.Server({ port: 4324 });

wss.on("connection", handleWebSocketConnection);
