import styles from './Game.module.css';
import { useSelector } from 'react-redux';
import { selectUserState } from 'features/user/user-selectors';
import { Auth } from 'components/Auth';
import { GameMenu } from 'components/GameMenu';
import { selectRoomState } from 'features/room/room-selectors';
import { Room } from 'components/Room';
import { useEffect, useRef, useState } from 'react';
import { isWebSocket } from 'types/typeGuards';
import { useAppDispatch } from 'store';
import {
  changeUserRoom,
  creatorDeletedTheRoom,
  userConnected,
  userDisconnected,
  usersLeaveRoom,
} from 'features/users/users-slice';
import { gameHistoryLoaded, setGHLoading } from 'features/gameHistory/gameHistory-slice';
import { GameT, RoomT, User } from 'types';
import { GH, GameHistoryType } from 'types/gameHistory';
import { guestConnected, guestDisconnected, setRoom } from 'features/room/room-slice';
import {
  createRoom,
  disconnected,
  loadRooms,
  changeGuestId,
  roomDeleted,
  roomsLeaveRoom,
} from 'features/rooms/rooms-slice';
import { selectGameState } from 'features/game/game-selectors';
import { selectRoomsState } from 'features/rooms/rooms-selectors';
import { selectUsersState } from 'features/users/users-selectors';
import { setIsOnline, setUser, userLeaveRoom } from 'features/user/user-slice';
import { GameDuel } from 'components/GameDuel';
import { createGame, changeGameState } from 'features/game/game-slice';
import { selectGameHistoryState } from 'features/gameHistory/gameHistory-selectors';

type WSMessageType = {
  event:
    | 'connection'
    | 'disconnection'
    | 'sendingGameHistory'
    | 'createRoom'
    | 'connectRoom'
    | 'setReadyState'
    | 'createGame'
    | 'sendWinner'
    | 'noTurn'
    | 'oponentNoTurn'
    | 'deleteRoom'
    | 'game finished'
    | 'leaveRoom'
    | 'getStatistics'
    | 'getGameHistory';

  payload: any;
};

type WSResType = {
  message: string;
};

export type OponentReadyState = 'ready' | 'not ready';

export const Game = () => {
  const dispatch = useAppDispatch();

  const userState = useSelector(selectUserState);
  const roomState = useSelector(selectRoomState);
  const gameState = useSelector(selectGameState);

  const roomsState = useSelector(selectRoomsState);
  const usersState = useSelector(selectUsersState);

  const ghState = useSelector(selectGameHistoryState);

  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [oponentReadyState, setOponentReadyState] = useState<OponentReadyState>('not ready');

  const [gameObj, setGameObj] = useState<{
    winner?: string;
  } | null>(null);

  const [statistics, setStatistics] = useState<{
    wins: number;
    looses: number;
    bestPlayer: { name: string; wins: number; looses: number };
    worstPlayer: { name: string; wins: number; looses: number };
  }>({
    wins: 0,
    looses: 0,
    bestPlayer: { name: '-', looses: 0, wins: 0 },
    worstPlayer: { name: '-', wins: 0, looses: 0 },
  });

  const [gh, setGh] = useState<GH>([]);

  useEffect(() => {
    console.log('roomState: ', roomState.room);
  }, [roomState.room]);
  useEffect(() => {
    console.log('userState: ', userState.currentUser);
  }, [userState.currentUser]);
  useEffect(() => {
    console.log('usersState: ', usersState.users);
  }, [usersState.users]);
  useEffect(() => {
    console.log('roomsState: ', roomsState.rooms);
  }, [roomsState.rooms]);
  useEffect(() => {
    console.log('gameState: ', gameState.game);
  }, [gameState.game]);

  useEffect(() => {
    if (isConnected === false) {
      socket.current = null;
    }

    if (isConnected === true) {
      socket.current = new WebSocket('ws://localhost:8080');
      // console.log('socket was set');

      if (isWebSocket(socket)) {
        socket.current.onopen = () => {
          const data = {
            event: 'connection',
            payload: {
              user: userState.currentUser,
            },
          };

          socket.current.send(JSON.stringify(data));
        };
      }
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected === true) {
      if (isWebSocket(socket)) {
        socket.current.onmessage = async (event) => {
          const data: WSMessageType = JSON.parse(event.data);

          if (data.event === 'connection') {
            const payload: WSResType & {
              users: User[];
              user: User;
              rooms?: RoomT[];
              gameHistory?: GameHistoryType;
              // allUsers: User[];
            } = data.payload;
            dispatch(userConnected(payload.users));

            if (payload.gameHistory) {
              dispatch(gameHistoryLoaded(payload.gameHistory));
            }

            if (payload?.user?._id === userState.currentUser?._id) {
              dispatch(setIsOnline(true));
            }
            if (payload.rooms) {
              dispatch(loadRooms(payload.rooms));
            }
          }

          if (data.event === 'disconnection') {
            const payload: WSResType & { user: User } = data.payload;

            if (payload.user.roomId) {
              dispatch(disconnected({ roomId: payload.user.roomId, userId: payload.user._id }));
            }

            if (payload.user.roomId === roomState.room?._id) {
              if (roomState.room.creatorId === payload.user._id) {
                dispatch(setRoom(null));
                if (payload.user.gameId) {
                  dispatch(changeGameState(null));
                }
              } else {
                dispatch(guestDisconnected());
                if (payload.user.gameId) {
                  dispatch(changeGameState(null));
                }
              }
            }
            dispatch(userDisconnected(payload.user));
          }

          if (data.event === 'sendingGameHistory') {
            const payload: WSResType & { gameHistory: GameHistoryType } = data.payload;
            console.log(data.payload);
          }

          if (data.event === 'createRoom') {
            const payload: WSResType & { room: RoomT; user: User } = data.payload;
            const { room: newRoom } = payload;

            if (newRoom.creatorId === userState.currentUser?._id) {
              dispatch(setRoom(newRoom));
              dispatch(setUser(payload.user));
            }
            dispatch(createRoom(newRoom));
            dispatch(changeUserRoom({ room: payload.room, user: payload.user }));
          }

          if (data.event === 'deleteRoom') {
            const payload: WSResType & { room: RoomT } = data.payload;
            console.log(payload);

            if (userState.currentUser?._id === payload.room.creatorId) {
              dispatch(setRoom(null));
            }
            if (userState.currentUser?._id === payload.room.guestId) {
              dispatch(setRoom(null));
            }
            dispatch(roomDeleted(payload.room));
            dispatch(creatorDeletedTheRoom(payload.room));
          }

          if (data.event === 'leaveRoom') {
            const payload: WSResType & { user: User; room: RoomT } = data.payload;

            if (payload.user._id === userState.currentUser?._id) {
              // userState
              dispatch(userLeaveRoom('guest'));

              // gameState
              dispatch(changeGameState(null));

              // roomState
              dispatch(setRoom(null));
            }

            if (payload.room.creatorId === userState.currentUser?._id) {
              // userState
              dispatch(userLeaveRoom('creator'));

              // gameState
              dispatch(changeGameState(null));

              // roomState
              dispatch(guestDisconnected());
            }

            dispatch(usersLeaveRoom({ user: payload.user, room: payload.room }));
            dispatch(roomsLeaveRoom(payload.room));
          }

          if (data.event === 'connectRoom') {
            const payload: WSResType & { room: RoomT; user: User } = data.payload;
            console.log(payload);

            if (payload.room.guestId === userState.currentUser?._id) {
              dispatch(setRoom(payload.room));
              dispatch(setUser(payload.user));
            }

            if (payload.room.creatorId === userState.currentUser?._id) {
              dispatch(guestConnected(payload.room.guestId));
            }

            dispatch(changeUserRoom({ room: payload.room, user: payload.user }));
            dispatch(changeGuestId({ room: payload.room, user: payload.user }));
          }

          if (data.event === 'setReadyState') {
            setOponentReadyState('ready');
          }

          if (data.event === 'createGame') {
            const payload: WSResType & { game: GameT } = data.payload;

            // Не оновлюється поле gameId у всіх користувачів у users & rooms
            // Поки можна цього не робити, для оптимізації і непотрібності
            dispatch(createGame(payload.game));
          }
          if (data.event === 'game finished') {
            const payload: WSResType & { gameHistory: GameHistoryType } = data.payload;
            dispatch(gameHistoryLoaded(payload.gameHistory));
            dispatch(changeGameState(null));
          }

          if (data.event === 'sendWinner') {
            const payload: WSResType & { winnerId: string } = data.payload;
            setGameObj((prev) => ({ ...prev, winner: payload.winnerId }));
          }

          // TODO
          if (data.event === 'noTurn') {
            const payload: { creator: 0 | 1; guest: 0 | 1; creatorId: string; guestId: string } =
              data.payload;
            if (payload.creator === 1 && payload.guest === 0) {
              if (userState.currentUser?._id === payload.creatorId) {
                socket.current.send(
                  JSON.stringify({ event: 'deleteRoom', payload: { room: roomState.room } }),
                );
              }
            } else if (payload.creator === 0 && payload.guest === 1) {
              if (userState.currentUser?._id === payload.guestId) {
                socket.current.send(
                  JSON.stringify({
                    event: 'leaveRoom',
                    payload: { room: roomState.room, user: userState.currentUser },
                  }),
                );
              }
            } else {
              if (userState.currentUser?._id === payload.creatorId) {
                socket.current.send(
                  JSON.stringify({ event: 'deleteRoom', payload: { room: roomState.room } }),
                );
              }
            }
            console.log(data.payload);
          }

          if (data.event === 'oponentNoTurn') {
          }

          if (data.event === 'getStatistics') {
            const payload: WSResType & {
              stats: {
                wins: number;
                looses: number;
                bestPlayer: { name: string; wins: number; looses: number };
                worstPlayer: { name: string; wins: number; looses: number };
              };
            } = data.payload;
            console.log(payload.stats);

            setStatistics(payload.stats);
          }

          if (data.event === 'getGameHistory') {
            const payload: { gameHistory: GH } = data.payload;
            setGh(payload.gameHistory);
          }
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConnected,
    userState.currentUser,
    roomState.room,
    gameState.game,
    roomsState.rooms,
    usersState.users,
  ]);

  if (!isConnected) {
    return (
      <div className={styles.game}>
        <Auth setIsConnected={setIsConnected} />
      </div>
    );
  }

  if (gameState.game) {
    return (
      <div className={styles.game}>
        <GameDuel winner={gameObj?.winner} socket={socket} />
      </div>
    );
  }

  if (roomState.room) {
    return (
      <div className={styles.game}>
        <Room
          winner={gameObj?.winner}
          setWinner={setGameObj}
          setOpReadyState={setOponentReadyState}
          oponentReadyState={oponentReadyState}
          socket={socket}
        />
      </div>
    );
  }

  return (
    <div className={styles.game}>
      <GameMenu gh={gh} statistics={statistics!} socket={socket} />
    </div>
  );
};
