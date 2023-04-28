import { createSlice } from '@reduxjs/toolkit';
import { Status } from 'types';
import { GameHistoryType } from 'types/gameHistory';

type GameHistorySlice = {
  status: Status;
  error: boolean;
  loading: boolean;
  gameHistory: GameHistoryType | null;
};

const initialState: GameHistorySlice = {
  status: 'idle',
  error: false,
  loading: false,
  gameHistory: null,
};

const gameHistorySlice = createSlice({
  name: '@@gameHistory',
  initialState,
  reducers: {
    gameHistoryLoaded: (prevState, action) => {
      return { ...prevState, gameHistory: action.payload };
    },
    setGHLoading: (prevState, action) => {
      return { ...prevState, loading: action.payload };
    },
  },
});

export const gameHistoryReducer = gameHistorySlice.reducer;
export const { gameHistoryLoaded, setGHLoading } = gameHistorySlice.actions;
