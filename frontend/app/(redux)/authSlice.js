import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Function to load user from AsyncStorage
const loadUserFromStorage = async () => {
  try {
    const userInfo = await AsyncStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error("Failed to load user info", error);
    return null;
  }
};

const initialState = {
  user: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginAction: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      AsyncStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    logoutAction: (state) => {
      state.user = null;
      state.loading = false;
      AsyncStorage.removeItem("userInfo");
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    updateUserAction: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { loginAction, logoutAction, setUser, setLoading, updateUserAction } =
  authSlice.actions;

export default authSlice.reducer;

export const loadUser = () => async (dispatch) => {
  const user = await loadUserFromStorage();
  if (user) {
    dispatch(setUser(user));
  } else {
    dispatch(setLoading(false));
  }
};

// At the bottom of authSlice.js
export const logout = () => async (dispatch) => {
  try {
    await AsyncStorage.removeItem("userInfo");
    dispatch(logoutAction());
  } catch (error) {
    console.error("Error removing user info during logout", error);
  }
};
