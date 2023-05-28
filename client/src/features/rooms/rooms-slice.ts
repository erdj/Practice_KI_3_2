import { createSlice } from '@reduxjs/toolkit';
import { Status, RoomT } from 'types';

type RoomsSlice = {
  status: Status;
  error: boolean;
  rooms: RoomT[] | null;
};

const initialState: RoomsSlice = {
  status: 'idle',
  error: false,
  rooms: null,
};

const roomSlice = createSlice({
  name: '@@rooms',
  initialState,
  reducers: {
    changeGuestId: (prevState, action) => {
      const updatedRooms = prevState.rooms!.map((i) => {
        const roomToUpdate = action.payload.room;
        return i._id === roomToUpdate._id ? { ...i, guestId: action.payload.user._id } : i;
      });
      prevState.rooms = updatedRooms;
    },

    createRoom: (prevState, action) => {
      prevState.rooms = prevState.rooms ? [...prevState.rooms, action.payload] : [action.payload];
    },
    loadRooms: (prevState, action) => {
      return { ...prevState, rooms: action.payload };
    },

    disconnected: (prevState, action) => {
      let isCreatorLeave = false;
      const roomId = action.payload.roomId;
      const userId = action.payload.userId;

      for (let i = 0; i < prevState.rooms!.length; i++) {
        const room = prevState.rooms![i];
        if (room._id === roomId) {
          if (room.creatorId === userId) {
            isCreatorLeave = true;
          }
          break;
        }
      }
      if (isCreatorLeave) {
        return { ...prevState, rooms: prevState.rooms!.filter((room) => room._id !== roomId) };
      } else {
        return {
          ...prevState,
          rooms: prevState.rooms!.map((room) => {
            if (room._id === roomId) {
              return { ...room, guestId: '', gameId: '' };
            } else {
              return room;
            }
          }),
        };
      }
    },

    roomDeleted: (prevState, action) => {
      if (prevState.rooms) {
        prevState.rooms = prevState.rooms?.filter((room) => room._id !== action.payload._id);
      }
    },
    roomsLeaveRoom(prevState, action) {
      const room = action.payload;
      if (prevState.rooms) {
        prevState.rooms = prevState.rooms.map((r) => {
          if (r._id === room._id) {
            return { ...r, guestId: '', gameId: '' };
          }
          return r;
        });
      }
    },
  },
});

export const roomsReducer = roomSlice.reducer;
export const { createRoom, loadRooms, changeGuestId, disconnected, roomDeleted, roomsLeaveRoom } =
  roomSlice.actions;
