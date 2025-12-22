import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE = "http://localhost:5000/api";
// Initial state
const initialState = {
    candidates: [],
    pendingCandidates: [],
    approvedCandidates: [],
    isLoading: false,
    error: null
};

// ======================================================
// THUNKS
// ======================================================

// Register candidate
export const registerCandidate = createAsyncThunk(
    "candidate/registerCandidate",
    async ({ privateKey, electionAddress, candidateName, party }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE}/election/registerCandidate`, {
                privateKey, electionAddress, candidateName, party,
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Validate candidate
export const validateCandidate = createAsyncThunk(
    "candidate/validateCandidate",
    async ({ privateKey, electionAddress, candidateId, isValid }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE}/election/validateCandidate`, {
                privateKey, electionAddress, candidateId, isValid
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Get candidate details
export const getCandidateDetails = createAsyncThunk(
    "candidate/getCandidateDetails",
    async ({ electionAddress, candidateId }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE}/election/getCandidateDetails`, {
                electionAddress, candidateId
            });
            console.log("candidates", response)
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Get pending candidates
export const getPendingCandidates = createAsyncThunk(
    "candidate/getPendingCandidates",
    async ({ electionAddress }, { rejectWithValue }) => {
        try {

            const response = await axios.post(`${API_BASE}/election/getPendingCandidates`, {
                electionAddress
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const getApprovedCandidates = createAsyncThunk(
    "candidate/getApprovedCandidates",
    async ({ electionAddress }, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `${API_BASE}/election/getApprovedCandidates`,
                { electionAddress }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);



// ======================================================
// SLICE
// ======================================================

const candidateSlice = createSlice({
    name: "candidate",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            // REGISTER CANDIDATE
            .addCase(registerCandidate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerCandidate.fulfilled, (state, action) => {
                state.isLoading = false;
                state.candidates.push(action.payload);
            })
            .addCase(registerCandidate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // VALIDATE CANDIDATE
            .addCase(validateCandidate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(validateCandidate.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(validateCandidate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // GET CANDIDATE DETAILS
            .addCase(getCandidateDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCandidateDetails.fulfilled, (state, action) => {
                state.isLoading = false;

                const candidateDetails = action.payload;
                const index = state.candidates.findIndex((c) => c.id === candidateDetails.id);

                if (index !== -1) {
                    state.candidates[index] = candidateDetails;
                } else {
                    state.candidates.push(candidateDetails);
                }
            })
            .addCase(getCandidateDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // GET PENDING CANDIDATES
            .addCase(getPendingCandidates.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getPendingCandidates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pendingCandidates = action.payload.candidates || [];
            })
            .addCase(getPendingCandidates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getApprovedCandidates.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getApprovedCandidates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.approvedCandidates = action.payload.candidates || [];
            })
            .addCase(getApprovedCandidates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

    }
});

export default candidateSlice.reducer;
