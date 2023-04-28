import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { updateUser } from './helpers.js';

dotenv.config();

// TODO
// the key for session will be a creator's id
// creatorId : {...}
const games = {};

// userId : socket
const onlineUsers = {};

// разобраться в интерсепторах
export const DB_REQ_CONFIG = {
  withCredentials: true,
  headers: {
    Authorization: `Bearer ` + jwt.sign({ role: 'admin' }, process.env.JWT_SECRET_KEY),
  },
  httpOnly: true,
};

const port = process.env.WS_SERVER_PORT || 8080;

const wss = new WebSocketServer({ port }, async () => {
  console.log('WebSocketServer started on port ' + port);
});

wss.on('connection', async function connection(socket, request) {
  socket.on('error', (err) => {
    console.log(err);
  });

  socket.on('close', async (code, reason) => {
    try {
      const {
        data: { user: disconnectedUser },
      } = await axios.get('http://localhost:5000/api/users/find/' + socket.userId, DB_REQ_CONFIG);

      const updateData = {
        isOnline: false,
      };

      if (disconnectedUser.roomId) {
        updateData.roomId = '';
      }
      if (disconnectedUser.gameId) {
        updateData.gameId = '';
      }

      delete onlineUsers[socket.userId];

      await updateUser(socket.userId, updateData);

      broadcastMessage({
        event: 'disconnection',
        payload: { message: 'User has been disconnected', user: disconnectedUser },
      });

      if (disconnectedUser.roomId) {
        const { data: roomToChange } = await axios.get(
          'http://localhost:5000/api/rooms/find/' + disconnectedUser.roomId,
          DB_REQ_CONFIG,
        );

        if (roomToChange.creatorId === disconnectedUser._id) {
          await axios.delete(
            'http://localhost:5000/api/rooms/' + disconnectedUser.roomId,
            DB_REQ_CONFIG,
          );

          if (roomToChange.guestId) {
            // TODO on CLIENT
            onlineUsers[roomToChange.guestId].send(JSON.stringify({ event: 'roomCreator left' }));

            const opDataToUpdate = {
              roomId: '',
            };

            if (roomToChange.gameId) {
              opDataToUpdate.gameId = '';
              await axios.delete(
                'http://localhost:5000/api/games/' + roomToChange.gameId,
                DB_REQ_CONFIG,
              );

              await updateUser(roomToChange.guestId, opDataToUpdate);
            } else {
              await updateUser(roomToChange.guestId, opDataToUpdate);
            }
          } else {
            if (roomToChange.gameId) {
              await axios.delete(
                'http://localhost:5000/api/games/' + disconnectedUser.gameId,
                DB_REQ_CONFIG,
              );
            }
          }
        } else {
          // TODO on CLIENT
          onlineUsers[roomToChange.creatorId].send(JSON.stringify({ event: 'roomGuest left' }));
          const roomDataToUpdate = {
            guestId: '',
          };
          if (roomToChange.gameId) {
            roomDataToUpdate.gameId = '';

            await axios.delete(
              'http://localhost:5000/api/games/' + roomToChange.gameId,
              DB_REQ_CONFIG,
            );

            await updateUser(roomToChange.creatorId, { gameId: '' });
          }
          await axios.put(
            'http://localhost:5000/api/rooms/' + roomToChange._id,
            roomDataToUpdate,
            DB_REQ_CONFIG,
          );
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  });

  socket.on('message', async (data) => {
    data = JSON.parse(data);

    if (data.event === 'connection') {
      const user = data.payload.user;
      try {
        const { data } = await updateUser(user._id, { isOnline: true });
        const socketUser = data.user;
        socket.userId = socketUser._id;

        onlineUsers[socket.userId] = socket;

        const {
          data: { users },
        } = await axios.get(process.env.EXPRESS_SERVER_URL + '/api/users/findall');
        const {
          data: { rooms },
        } = await axios.get(process.env.EXPRESS_SERVER_URL + '/api/rooms/findall');

        const {
          data: { gameHistory },
        } = await axios.get(
          process.env.EXPRESS_SERVER_URL + '/api/games_history/find/' + socketUser.gameHistoryId,
          DB_REQ_CONFIG,
        );

        socket.send(
          JSON.stringify({
            event: 'connection',
            payload: {
              message: 'User has been connected!',
              users: users.filter((u) => u.isOnline === true),
              // allUsers: users,
              rooms,
              user: data.user,
              gameHistory,
            },
          }),
        );

        broadcastMessageExceptionally(
          {
            event: 'connection',
            payload: { message: 'User has been connected', users: [socketUser] },
          },
          socketUser._id,
        );
      } catch (err) {
        console.log(err.message);
      }
    }

    if (data.event === 'showStatistics') {
      // w/l calcukation
    }
    if (data.event === 'showGamesHistory') {
      const { user } = data.payload;
      const {
        data: { gameHistory: dbGameHistory },
      } = await axios.get(
        process.env.EXPRESS_SERVER_URL + '/api/games_history/find/' + user.gameHistoryId,
        DB_REQ_CONFIG,
      );

      const gameHistory = await loadGames(dbGameHistory);

      broadcastMessageById(
        { event: 'sendingGameHistory', payload: { message: "User's games history", gameHistory } },
        socket.userId,
      );
    }
    if (data.event === 'showAvailableRooms') {
    }

    if (data.event === 'createRoom') {
      try {
        const {
          data: { room },
        } = await axios.post(
          process.env.EXPRESS_SERVER_URL + '/api/rooms/',
          {
            ...data.payload.room,
            creatorId: data.payload.user._id,
          },
          DB_REQ_CONFIG,
        );
        const {
          data: { user },
        } = await updateUser(data.payload.user._id, { roomId: room._id });

        broadcastMessage({
          event: 'createRoom',
          payload: { message: 'room has been created', room, user },
        });
      } catch (err) {
        console.log(err.message);
      }
    }
    if (data.event === 'deleteRoom') {
      try {
        const {
          data: { room: deletedRoom },
        } = await axios.delete(
          process.env.EXPRESS_SERVER_URL + '/api/rooms/' + data.payload.room._id,
          DB_REQ_CONFIG,
        );
        const {
          data: { user: changedCreator },
        } = await axios.put(
          process.env.EXPRESS_SERVER_URL + '/api/users/' + deletedRoom.creatorId,
          { roomId: '' },
          DB_REQ_CONFIG,
        );
        if (deletedRoom.guestId) {
          const {
            data: { room: changedGuest },
          } = await axios.put(
            process.env.EXPRESS_SERVER_URL + '/api/users/' + deletedRoom.guestId,
            { roomId: '' },
            DB_REQ_CONFIG,
          );
        }

        broadcastMessage({ event: 'deleteRoom', payload: { room: deletedRoom } });
      } catch (err) {
        console.log(err);
      }
    }

    if (data.event === 'leaveRoom') {
      const { user, room } = data.payload;

      const {
        data: { user: updatedCreator },
      } = await updateUser(room.creatorId, {
        gameId: '',
      });
      console.log(1, updatedCreator);
      const {
        data: { user: updatedGuest },
      } = await updateUser(user._id, { roomId: '', gameId: '' });
      console.log(2, updatedGuest);
      const {
        data: { room: updatedRoom },
      } = await axios.put(
        process.env.EXPRESS_SERVER_URL + '/api/rooms/' + room._id,
        {
          guestId: '',
          gameId: '',
        },
        DB_REQ_CONFIG,
      );
      console.log(3, updatedRoom);
      if (room.gameId) {
        const {
          data: { game },
        } = await axios.delete(
          process.env.EXPRESS_SERVER_URL + '/api/games/' + room.gameId,
          DB_REQ_CONFIG,
        );
        console.log((4, game));
      }
      broadcastMessage({
        event: 'leaveRoom',
        payload: {
          user: updatedGuest,
          room: updatedRoom,
        },
      });
    }

    if (data.event === 'connectRoom') {
      const {
        data: { room },
      } = await axios.put(
        process.env.EXPRESS_SERVER_URL + '/api/rooms/' + data.payload.room._id,
        { guestId: data.payload.user._id },
        DB_REQ_CONFIG,
      );
      const {
        data: { user },
      } = await updateUser(data.payload.user._id, { roomId: data.payload.room._id });

      broadcastMessage({
        event: 'connectRoom',
        payload: {
          message: 'user connected to room',
          room,
          user,
        },
      });
    }

    if (data.event === 'setReadyState') {
      const { user, room } = data.payload;
      if (user._id === room.creatorId) {
        onlineUsers[room.guestId].send(
          JSON.stringify({ event: 'setReadyState', payload: { message: 'creator is ready' } }),
        );
      }
      if (user._id === room.guestId) {
        onlineUsers[room.creatorId].send(
          JSON.stringify({ event: 'setReadyState', payload: { message: 'guest is ready' } }),
        );
      }
    }

    if (data.event === 'createGame') {
      const {
        payload: { room },
      } = data;
      const {
        data: { game: newGame },
      } = await axios.post(
        process.env.EXPRESS_SERVER_URL + '/api/games/',
        {
          creatorId: room.creatorId,
          guestId: room.guestId,
          roomId: room._id,
        },
        DB_REQ_CONFIG,
      );
      games[room._id] = newGame;

      onlineUsers[room.creatorId].send(
        JSON.stringify({
          event: 'createGame',
          payload: { message: 'game started', game: newGame },
        }),
      );
      onlineUsers[room.guestId].send(
        JSON.stringify({
          event: 'createGame',
          payload: { message: 'game started', game: newGame },
        }),
      );
    }

    if (data.event === 'game finished') {
      const { game, room, user } = data.payload;
      const {
        data: { user: oponent },
      } = await axios.get(
        process.env.EXPRESS_SERVER_URL + '/api/users/find/' + game.guestId,
        DB_REQ_CONFIG,
      );

      const {
        data: { gameHistory: creatorGameHistory },
      } = await axios.put(
        process.env.EXPRESS_SERVER_URL + '/api/games_history/' + user.gameHistoryId,
        {
          gameId: game._id,
        },
        DB_REQ_CONFIG,
      );
      const {
        data: { gameHistory: guestGameHistory },
      } = await axios.put(
        process.env.EXPRESS_SERVER_URL + '/api/games_history/' + oponent.gameHistoryId,
        {
          gameId: game._id,
        },
        DB_REQ_CONFIG,
      );

      onlineUsers[game.creatorId].send(
        JSON.stringify({
          event: 'game finished',
          payload: { message: 'game finished', gameHistory: creatorGameHistory },
        }),
      );
      onlineUsers[game.guestId].send(
        JSON.stringify({
          event: 'game finished',
          payload: { message: 'game finished', gameHistory: guestGameHistory },
        }),
      );

      delete games[room._id];
    }

    if (data.event === 'sendTurn') {
      const {
        payload: { game, user, turn },
      } = data;

      if (user._id === game.creatorId) {
        games[game.roomId] = {
          ...games[game.roomId],
          result: { ...games[game.roomId].result, creator: turn ? turn : null },
        };
      } else {
        games[game.roomId] = {
          ...games[game.roomId],
          result: { ...games[game.roomId].result, guest: turn ? turn : null },
        };
      }

      if (games[game.roomId].result.creator !== '' && games[game.roomId].result.guest !== '') {
        const creatorTurn = games[game.roomId].result.creator;
        const guestTurn = games[game.roomId].result.guest;

        let isNoTurn = false;

        if (creatorTurn === null || guestTurn === null) {
          isNoTurn = true;
        }

        if (isNoTurn) {
          broadcastMessage({
            event: 'noTurn',
            payload: {
              ...(!creatorTurn && !guestTurn
                ? {
                    creator: 1,
                    guest: 1,
                  }
                : !creatorTurn
                ? {
                    creator: 1,
                    guest: 0,
                  }
                : {
                    creator: 0,
                    guest: 1,
                  }),
              creatorId: game.creatorId,
              guestId: game.guestId,
            },
          });
          // If someone didint send turn, nothing would happen
        } else {
          if (creatorTurn === guestTurn) {
            games[game.roomId].result.winner = 'draw';
          }

          if (creatorTurn === 'paper' && guestTurn === 'rock') {
            games[game.roomId].result.winner = game.creatorId;
          } else if (creatorTurn === 'paper' && guestTurn === 'scissors') {
            games[game.roomId].result.winner = game.guestId;
          }

          if (creatorTurn === 'rock' && guestTurn === 'paper') {
            games[game.roomId].result.winner = game.guestId;
          } else if (creatorTurn === 'rock' && guestTurn === 'scissors') {
            games[game.roomId].result.winner = game.creatorId;
          }

          if (creatorTurn === 'scissors' && guestTurn === 'paper') {
            games[game.roomId].result.winner = game.creatorId;
          } else if (creatorTurn === 'scissors' && guestTurn === 'rock') {
            games[game.roomId].result.winner = game.guestId;
          }

          await axios.put(
            process.env.EXPRESS_SERVER_URL + '/api/games/' + game._id,
            {
              result: games[game.roomId].result,
            },
            DB_REQ_CONFIG,
          );

          onlineUsers[game.creatorId].send(
            JSON.stringify({
              event: 'sendWinner',
              payload: {
                message: 'game was calculated',
                winnerId: games[game.roomId].result.winner,
              },
            }),
          );
          const winnerId = games[game.roomId].result.winner;

          onlineUsers[game.guestId].send(
            JSON.stringify({
              event: 'sendWinner',
              payload: {
                message: 'game was calculated',
                winnerId,
              },
            }),
          );

          // TODO если что доделать чтобы пользователю отправляло ещё и обновленные результаты его побед и поражений (пока нет нужды)
          if (winnerId !== 'draw') {
            const W = game.creatorId === winnerId ? game.creatorId : game.guestId;
            const L = game.creatorId === winnerId ? game.guestId : game.creatorId;
            const {
              data: { user: winner },
            } = await axios.get(process.env.EXPRESS_SERVER_URL + '/api/users/win/' + W);
            const {
              data: { user: looser },
            } = await axios.get(process.env.EXPRESS_SERVER_URL + '/api/users/loose/' + L);
          }
          // TODO save the game to users game history
        }
      }
    }

    if (data.event === 'playAgain') {
      // deleteSession
      // deleteGame
    }
    if (data.event === 'sendTurn') {
      // if server has both turns, it can calculeate result and send it to users
      // calculateGameResult()
    }

    if (data.event === 'getUser') {
    }
    if (data.event === 'getUsers') {
    }
    if (data.event === 'getOnlineUsers') {
    }

    if (data.event === 'getRoom') {
    }
    if (data.event === 'getRooms') {
      try {
      } catch (err) {}
    }

    if (data.event === 'getGameHistory') {
    }

    if (data.event === 'getGame') {
    }

    if (data.event === 'getStatistics') {
      const { data: res } = await axios.get(
        process.env.EXPRESS_SERVER_URL + '/api/users/stats/' + data.payload.userId,
        DB_REQ_CONFIG,
      );
      const {
        bestPlayer,
        worstPlayer,
        user: { wins, looses },
      } = res;
      const stats = { wins, looses, bestPlayer, worstPlayer };
      socket.send(
        JSON.stringify({
          event: 'getStatistics',
          payload: {
            stats,
          },
        }),
      );
    }

    if (data.event === 'getGameHistory') {
      const { data: res } = await axios.get(
        process.env.EXPRESS_SERVER_URL + '/api/games/getHistory/' + data.payload.user._id,
        DB_REQ_CONFIG,
      );
      socket.send(
        JSON.stringify({
          event: 'getGameHistory',
          payload: {
            gameHistory: res.gameHistory,
          },
        }),
      );
    }
  });
  // при подключении пользователя, на его скоет можно повесить слашатели (такие же как и сервера)
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

function calculateGameResult(game) {}

async function loadGames(gh) {
  const gameHistory = [];
  for (let i = 0; i < gh.gamesId.length; i++) {
    const gameId = gh.gamesId[i];
    try {
      const {
        data: { game },
      } = await axios.get(
        process.env.EXPRESS_SERVER_URL + '/api/games/find/' + gameId,
        DB_REQ_CONFIG,
      );
      gameHistory.push(game);
    } catch (err) {
      console.log(err.message, i, gameId);
    }
  }
  return gameHistory;
}
