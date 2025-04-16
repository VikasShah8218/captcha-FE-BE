import { createSlice } from "@reduxjs/toolkit";
import { loginUser ,logoutUser} from "../../globals/auth";
import { loadUserInfo, checkInitialAuth } from "../../globals/auth";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    authenticated: checkInitialAuth(),
    user: loadUserInfo(),
    requestLoading : false,
    wsMessage: null,
    wsConnection: null,
  },
  reducers: {
    login: (state, action) => {
      const token = action.payload.access_token
      delete (action.payload).access_token
      loginUser(token, action.payload);
      state.authenticated = true;
    },
    logout: (state) => {
      state.authenticated = false;
      logoutUser();
    },
    setRequestLoading:(state,action) =>{
      state.requestLoading = action.payload
    },
    setWsMessage: (state, action) => {
      state.wsMessage = action.payload;
    },
    setWsConnection: (state, action) => {
      state.wsConnection = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { login, logout, setRequestLoading, setWsMessage ,setWsConnection } = authSlice.actions;

export default authSlice.reducer;
