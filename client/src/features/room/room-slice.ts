import { createSlice } from '@reduxjs/toolkit';
import { Status, RoomT } from 'types';

type RoomSlice = {
  status: Status;
  error: boolean;
  room: RoomT | null;
};

const initialState: RoomSlice = {
  status: 'idle',
  error: false,
  room: null,
};

const roomSlice = createSlice({
  name: '@@rooms',
  initialState,
  reducers: {
    setRoom: (prevState, action) => {
      prevState.room = action.payload;
    },

    guestConnected: (prevState, action) => {
      if (prevState.room) {
        prevState.room.guestId = action.payload;
      }
    },
    guestDisconnected: (prevState) => {
      if (prevState.room) {
        prevState.room.guestId = '';
        prevState.room.gameId = '';
      }
    },
  },
});

export const roomReducer = roomSlice.reducer;
export const { setRoom, guestConnected, guestDisconnected } = roomSlice.actions;
