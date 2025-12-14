import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Initial state roles
const initialState={
    users:[],
    loading:false,
    error:null
}

// ---------------------------
// Async Thunks
// ---------------------------

//assignRole

export const assignRole = createAsyncThunk(
  "role/assignRole",
  async ({ walletAddress, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/role/assign`, {
        walletAddress,
        role
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }   
  }
);

export const removeRole = createAsyncThunk(
  "role/removeRole",
  async ({ walletAddress, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/role/remove`, {
        walletAddress,
        role
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }   
  }
);

//getAllUsers

export const getAllUsers = createAsyncThunk(
  "role/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/role/users`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


// ---------------------------
// Slice
// ---------------------------

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
     setUsers: (state, action) => {
       state.users = action.payload;
     },
     clearUsers: (state) => {
       state.users = [];
     }
  },
  extraReducers: (builder) => {
    builder
      .addCase(assignRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignRole.fulfilled, (state, action) => {
        state.loading = false;

      })
      .addCase(assignRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeRole.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(removeRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});



export default roleSlice.reducer;