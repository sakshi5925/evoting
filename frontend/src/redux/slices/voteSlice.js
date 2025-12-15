import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  hasVoted: false,
  votedCandidateId: null,
  isLoading: false,
  error: null
};

// THUNKS

// Cast vote
export const castVote = createAsyncThunk(
  "vote/castVote",
  async ({ privateKey, electionAddress, candidateId }, { rejectWithValue }) => {
      try {
          const response = await axios.post(`${API_BASE}/election/castVote`, {
              privateKey,
              electionAddress,
              candidateId
          });
          return response.data;
      } catch (err) {
          return rejectWithValue(err.response?.data?.message || err.message);
      }
  }
);

// get Voter Status
export const getVoterStatus = createAsyncThunk(
  "vote/getVoterStatus",
  async ({ electionAddress, walletAddress }, { rejectWithValue }) => {
      try {
          const response = await axios.post(`${API_BASE}/election/getVoterStatus`, {
              electionAddress,
              walletAddress
          });
          return response.data;
      } catch (err) {
          return rejectWithValue(err.response?.data?.message || err.message);
      }
  }
);

// SLICE
const voteSlice = createSlice({
  name: "vote",
  initialState,
  reducers: {
    resetVoteState: (state) => {
      state.hasVoted = false;
      state.votedCandidateId = null;
      state.isLoading = false;
      state.error = null;
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(castVote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(castVote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasVoted = true;
      })
      .addCase(castVote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getVoterStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVoterStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasVoted = action.payload.hasAlreadyVoted;
        state.votedCandidateId = action.payload.votedFor;
      })
      .addCase(getVoterStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default voteSlice.reducer;
