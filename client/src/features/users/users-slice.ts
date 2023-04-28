import { createSlice } from '@reduxjs/toolkit';
import { Status, User } from 'types';

type UsersSlice = {
  status: Status;
  error: boolean;
  users: User[] | null;
};

const initialState: UsersSlice = {
  status: 'idle',
  error: false,
  users: null,
};

const usersSlice = createSlice({
  name: '@@users',
  initialState,
  reducers: {
    changeUserRoom: (prevState, action) => {
      const updatedUsers = prevState.users!.map((i) => {
        const roomId = action.payload.room._id;
        const isTheUser = i._id === action.payload.user._id;
        return isTheUser ? { ...i, roomId } : i;
      });
      prevState.users = updatedUsers;
    },

    userConnected: (prevState, action) => {
      if (prevState.users) {
        return {
          ...prevState,
          users: [...prevState.users, ...action.payload],
        };
      }
      return {
        ...prevState,
        users: [...action.payload],
      };
    },
    userDisconnected: (prevState, action) => {
      if (prevState.users) {
        return {
          ...prevState,
          users: prevState.users.filter((user) => {
            return user._id !== action.payload._id;
          }),
        };
      }
      return prevState;
    },
    creatorDeletedTheRoom(prevState, action) {
      const roomId = action.payload._id;
      const updatedUsers = prevState.users!.map((i) => {
        const isTheUser = i.roomId === roomId;
        return isTheUser ? { ...i, roomId: '' } : i;
      });
      prevState.users = updatedUsers;
    },
    usersLeaveRoom(prevState, action) {
      const { user, room } = action.payload;
      if (prevState.users) {
        prevState.users = prevState.users.map((u) => {
          if (u._id === user._id) {
            return { ...u, roomId: '', gameId: '' };
          }
          if (u._id === room.creatorId) {
            return { ...u, gameId: '' };
          }
          return u;
        });
      }
    },
  },
});

export const {
  userConnected,
  userDisconnected,
  changeUserRoom,
  creatorDeletedTheRoom,
  usersLeaveRoom,
} = usersSlice.actions;
export const usersReducer = usersSlice.reducer;
