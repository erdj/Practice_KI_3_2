import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from 'features/user/user-slice';
import { useDispatch } from 'react-redux';
import * as api from 'APIconfig';
import axios from 'axios';
import { usersReducer } from 'features/users/users-slice';
import { roomReducer } from 'features/room/room-slice';
import { roomsReducer } from 'features/rooms/rooms-slice';
import { gameReducer } from 'features/game/game-slice';
import { gameHistoryReducer } from 'features/gameHistory/gameHistory-slice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    users: usersReducer,
    room: roomReducer,
    rooms: roomsReducer,
    game: gameReducer,
    gameHistory: gameHistoryReducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {
          client: axios,
          api,
        },
      },
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
