import { createSlice } from "@reduxjs/toolkit";

const walletSlice = createSlice({
    name :"wallet",
    initialState:{
        walletAddress: null,
        isConnected: false,
    },
    reducers:{
        setWalletAddress:(state, action) =>{
            state.walletAddress = action.payload;
            state.isConnected = true;
        },
        clearWalletAddress:(state) =>{
            state.walletAddress = null;
            state.isConnected = false;
        }
    }
});

export const { setWalletAddress, clearWalletAddress } = walletSlice.actions;

export default walletSlice.reducer;