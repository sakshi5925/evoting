import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { act } from "react";

const API_BASE = "http://localhost:5000/api";

// Initial state
const initialState = {
  allelections: [],
  upcomingElections: [],
  OngoingElections: [],
  CompletedElections: [],
  error: null,
  isLoading: false,
};


// ---------------------------
// Async Thunks
// ---------------------------

//createElection

export const createElection = createAsyncThunk(
  "election/createElection",
  async ({ privateKey, ElectionName, description, ElectionStartTime, ElectionEndTime, registrationDeadline, electionManager }, { rejectWithValue }) => {
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

//deactivateElection
export const deactivateElection = createAsyncThunk(
  "election/deactivateElection",
  async ({ privateKey, electionAddress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/election/deactivate`, { electionId });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//reactivateElection
export const reactivateElection = createAsyncThunk(
  "election/reactivateElection",
  async ({ privateKey, electionAddress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/election/reactivate`, { electionId });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//getElectionByAddress
// export const getElectionByAddress = createAsyncThunk(
//   "election/getElectionByAddress",
//   async ({ electionAddress }, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(`${API_BASE}/election/getByAddress`, { electionAddress });
//       return response.data;
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

//startCandidateRegistration
export const startCandidateRegistration = createAsyncThunk(
  "election/startCandidateRegistration",
  async ({ privateKey, electionAddress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/election/startCandidateRegistration`, { electionAddress });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//startVoting
export const startVoting = createAsyncThunk(
  "election/startVoting",
  async ({ privateKey, electionAddress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/election/startVoting`, { electionAddress });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//endElection
export const endElection = createAsyncThunk(
  "election/endElection",
  async ({ privateKey, electionAddress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/election/endElection`, { electionAddress });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//declareResults
export const declareResults = createAsyncThunk(
  "election/declareResults",
  async ({ privateKey, electionAddress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/election/declareResults`, { electionAddress });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//changeStatus
export const changeStatus = createAsyncThunk(
  "election/changeStatus",
  async ({ privateKey, electionAddress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/election/changeStatus`, { electionAddress });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//getWinner
export const getWinner = createAsyncThunk(
  "election/getWinner",
  async ({ electionAddress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/election/getWinner`, { electionAddress });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//getUpcomingElections
export const getUpcomingElections = createAsyncThunk(
  "election/getUpcomingElections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/election/getUpcomingElections`);
      console.log("Upcoming Elections in redux:", response.data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//getOngoingElections
export const getOngoingElections = createAsyncThunk(
  "election/getOngoingElections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/election/getOngoingElections`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//getCompletedElections
export const getCompletedElections = createAsyncThunk(
  "election/getCompletedElections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/election/getCompletedElections`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

//getAllElections
export const getAllElections = createAsyncThunk(
  "election/getAllElections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/election/getAllElections`);
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
        state.allelections.push(action.payload);
      })
      .addCase(createElection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deactivateElection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deactivateElection.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.allelections.findIndex(election => election.address === action.payload.electionAddress);
        if (index !== -1) {
          state.allelections[index].status = "inactive";
        }
      })
      .addCase(deactivateElection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(reactivateElection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reactivateElection.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.allelections.findIndex(election => election.address === action.payload.electionAddress);
        if (index !== -1) {
          state.allelections[index].status = "active";
        }
      })
      .addCase(reactivateElection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // .addCase(getElectionByAddress.pending, (state) => {
      //   state.isLoading = true;
      //   state.error = null;
      // })
      // .addCase(getElectionByAddress.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   const election = action.payload;
      //   const index = state.allelections.findIndex(e => e.address === election.address);
      //   if (index !== -1) {
      //     state.allelections[index] = election;
      //   } else {
      //     state.allelections.push(election);
      //   }
      // })
      // .addCase(getElectionByAddress.rejected, (state, action) => {
      //   state.isLoading = false;
      //   state.error = action.payload;
      // })
      .addCase(startCandidateRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startCandidateRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        const election = action.payload;
        const index = state.allelections.findIndex(e => e.address === election.address);
        if (index !== -1) {
          state.allelections[index] = election;
        } else {
          state.allelections.push(election);
        }
      })
      .addCase(startCandidateRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(startVoting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startVoting.fulfilled, (state, action) => {
        state.isLoading = false;
        const election = action.payload;
        const index = state.allelections.findIndex(e => e.address === election.address);
        if (index !== -1) {
          state.allelections[index] = election;
        } else {
          state.allelections.push(election);
        }
      })
      .addCase(startVoting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(endElection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(endElection.fulfilled, (state, action) => {
        state.isLoading = false;
        const election = action.payload;
        const index = state.allelections.findIndex(e => e.address === election.address);
        if (index !== -1) {
          state.allelections[index] = election;
        } else {
          state.allelections.push(election);
        }
      })
      .addCase(endElection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(declareResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(declareResults.fulfilled, (state, action) => {
        state.isLoading = false;
        const election = action.payload;
        const index = state.allelections.findIndex(e => e.address === election.address);
        if (index !== -1) {
          state.allelections[index] = election;
        } else {
          state.allelections.push(election);
        }
      })
      .addCase(declareResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(changeStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const election = action.payload;
        const index = state.allelections.findIndex(e => e.address === election.address);
        if (index !== -1) {
          state.allelections[index] = election;
        } else {
          state.allelections.push(election);
        }
      })
      .addCase(changeStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getWinner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWinner.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(getWinner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUpcomingElections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUpcomingElections.fulfilled, (state, action) => {
        state.isLoading = false;

        const elections = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.elections || [];

        elections.forEach((incomingElection) => {
          const index = state.upcomingElections.findIndex(
            (e) => e._id === incomingElection._id
          );

          if (index !== -1) {
            state.upcomingElections[index] = incomingElection;
          } else {
            state.upcomingElections.push(incomingElection);
          }
        });
      })
      .addCase(getUpcomingElections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getOngoingElections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOngoingElections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.OngoingElections = action.payload;

      })
      .addCase(getOngoingElections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getCompletedElections.pending, (state) => {
        state.isLoading = true;
        state.error = null;

      })
      .addCase(getCompletedElections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.CompletedElections = action.payload;
      })
      .addCase(getCompletedElections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllElections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllElections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allelections = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.elections || [];
      })

      .addCase(getAllElections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

  },
});



export default electionSlice.reducer; 