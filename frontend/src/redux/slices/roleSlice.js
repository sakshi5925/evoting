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
      console.log("Assigning role:", role, "to user:", walletAddress);
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

//checkRoles

export const checkRoles = createAsyncThunk(
  "role/checkRoles",
  async ({ walletAddress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/role/check",
        { walletAddress }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
 
export const ElectionManagersList = createAsyncThunk(
  "role/ElectionManagersList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/role/election-managers`);
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
      .addCase(checkRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkRoles.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(checkRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(ElectionManagersList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ElectionManagersList.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(ElectionManagersList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});



export default roleSlice.reducer;