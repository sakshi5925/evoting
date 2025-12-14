import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Initial state
const initialState = {
  elections: [],
  error: null,
  isLoading: false,  
};


// ---------------------------
// Async Thunks
// ---------------------------

//createElection

export const createElection = createAsyncThunk(
  "election/createElection",
  async ({ privateKey,ElectionName, description,ElectionStartTime,ElectionEndTime,registrationDeadline,electionManager }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/election/create`, {
        privateKey,
        ElectionName,
        description,
        ElectionStartTime,
        ElectionEndTime,
        registrationDeadline,
        electionManager
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



// ---------------------------
// Slice
// ---------------------------

const electionSlice = createSlice({
  name: "election",
  initialState,
  reducers: {
    
  },
  extraReducers: (builder) => {
    builder
        .addCase(createElection.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(createElection.fulfilled, (state, action) => {
          state.isLoading = false;
          state.elections.push(action.payload);
        })
        .addCase(createElection.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        });
  },
});



export default electionSlice.reducer;