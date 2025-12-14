import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Initial state
const initialState = {
  walletAddress: null,
  chainId: null,
  isWalletConnected: false,
  token: null,
  user:null,  
  error: null,
  isLoading: false,
};



// ---------------------------
// Async Thunk 
// ---------------------------

// connect user wallet
export const connectWallet = createAsyncThunk(
  "auth/connectWallet",
  async (_, { rejectWithValue }) => {
    try {
      if (!window.ethereum) {
        return rejectWithValue("MetaMask not installed");
      }

      // Request accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts.length) {
        return rejectWithValue("No account found");
      }

      // Get chainId
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      return {
        walletAddress: accounts[0],
        chainId,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Register user
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, walletAddress, AdhaarNumber, DOB , VoterID}, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        name,
        walletAddress,
        AdhaarNumber,
        VoterID,
        DOB
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ walletAddress, AdhaarNumber }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        walletAddress,
        AdhaarNumber,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// ---------------------------
// Slice
// ---------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.walletAddress = null;
      state.chainId = null;
      state.isWalletConnected = false;
      state.token = null;
      state.user = null;
      state.error = null;
      state.isLoading = false;
    },
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoggedIn = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.status = "loading";
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.walletAddress = action.payload.walletAddress;
        state.chainId = action.payload.chainId;
        state.isWalletConnected = true;
        state.isLoading = false;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

  },
});

export const { logoutUser, setCredentials } = authSlice.actions;
export default authSlice.reducer;
