import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const games = {};

const onlineUsers = {};

const port = process.env.WS_SERVER_PORT || 8080;

const wss = new WebSocketServer({ port }, async () => {
  console.log('WebSocketServer started on port ' + port);
});

wss.on('connection', async function connection(socket, request) {
  socket.on('error', (err) => {
    console.log(err);
  });

  socket.on('close', async (code, reason) => {
    console.log('closed');
  });

  socket.on('message', async (data) => {
    data = JSON.parse(data);
    console.log(data);
  });
});

function broadcastMessage(data) {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(data));
  });
}

function broadcastMessageExceptionally(data, id) {
  wss.clients.forEach((client) => {
    if (client.userId !== id) {
      client.send(JSON.stringify(data));
    }
  });
}

function broadcastMessageById(data, id) {
  wss.clients.forEach((client) => {
    if (client.userId === id) {
      client.send(JSON.stringify(data));
    }
  });
}
