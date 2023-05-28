import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Extra, SignupInfo, UserRes, Status, User, SigninInfo, GoogleInfo } from 'types';
import { userResToUserType } from '../../helpers';

export const signupUser = createAsyncThunk<
  UserRes,
  SignupInfo,
  {
    state: { user: UserSlice };
    extra: Extra;
    rejectValue: string;
  }
>('@@user/signup-user', async function (auth, { extra: { api, client }, rejectWithValue }) {
  try {
    return await client.post<UserRes>(api.HTTPServerUrl + '/api/auth/signup', auth).then((res) => {
      return res.data;
    });
  } catch (err) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('Unknown error');
  }
});

export const signinUser = createAsyncThunk<
  UserRes,
  SigninInfo,
  {
    state: { user: UserSlice };
    extra: Extra;
    rejectValue: string;
  }
>('@@user/signin-user', async function (auth, { extra: { api, client }, rejectWithValue }) {
  try {
    return await client.post<UserRes>(api.HTTPServerUrl + '/api/auth/signin', auth).then((res) => {
      return res.data;
    });
  } catch (err) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('Unknown error');
  }
});

export const googleAuth = createAsyncThunk<
  User,
  GoogleInfo,
  {
    state: { user: UserSlice };
    extra: Extra;
    rejectValue: string;
  }
>('@@user/googleauth-user', async function (auth, { extra: { api, client }, rejectWithValue }) {
  try {
    return await client
      .post<{ user: User }>(api.HTTPServerUrl + '/api/auth/google', auth)
      .then((res) => {
        return res.data.user;
      });
  } catch (err) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('Unknown error');
  }
});

type UserSlice = {
  status: Status;
  error: boolean;
  currentUser: User | null;
};

const initialState: UserSlice = {
  status: 'idle',
  error: false,
  currentUser: null,
};

const userSlice = createSlice({
  name: '@@user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      if (action.payload === null) {
      } else {
        state.currentUser = { ...action?.payload };
      }
    },
    setIsOnline(state, action: PayloadAction<boolean>) {
      if (state.currentUser) state.currentUser.isOnline = action.payload;
    },
    userLeaveRoom(prevState, action) {
      if (action.payload === 'guest') {
        if (prevState.currentUser) {
          prevState.currentUser = { ...prevState.currentUser, gameId: '', roomId: '' };
        }
      } else if (action.payload === 'creator') {
        if (prevState.currentUser) {
          prevState.currentUser = { ...prevState.currentUser, gameId: '' };
        }
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.status = 'loading';
        state.error = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = true;
        // state.error = action.payload || 'Cannot load data';
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = 'received';
        state.currentUser = userResToUserType(action.payload);
      });

    builder
      .addCase(signinUser.pending, (state) => {
        state.status = 'loading';
        state.error = false;
      })
      .addCase(signinUser.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = true;
        // state.error = action.payload || 'Cannot load data';
      })
      .addCase(signinUser.fulfilled, (state, action) => {
        state.status = 'received';
        state.currentUser = userResToUserType(action.payload);
      });

    builder
      .addCase(googleAuth.pending, (state) => {
        state.status = 'loading';
        state.error = false;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = true;
        // state.error = action.payload || 'Cannot load data';
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.status = 'received';
        state.currentUser = action.payload;
      });
  },
});

export const userReducer = userSlice.reducer;
export const { setUser, setIsOnline, userLeaveRoom } = userSlice.actions;
