import { createSlice } from '@reduxjs/toolkit';
import { Status, GameT } from 'types';

type GameSlice = {
  status: Status;
  error: boolean;
  game: GameT | null;
};

const initialState: GameSlice = {
  status: 'idle',
  error: false,
  game: null,
};

const gameSlice = createSlice({
  name: '@@game',
  initialState,
  reducers: {
    createGame(prevState, action) {
      prevState.game = action.payload;
    },
    changeGameState(prevState, action) {
      prevState.game = action.payload;
    },
  },
});

export const gameReducer = gameSlice.reducer;
export const { createGame, changeGameState } = gameSlice.actions;
