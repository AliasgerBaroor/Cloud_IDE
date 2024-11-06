import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    addFile: (state, action) => {
      state.push({ name: action.payload.name, code: action.payload.code });
    },
    updateFileCode: (state, action) => {
      const file = state.find((file) => file.name === action.payload.name);
      if (file) {
        file.code = action.payload.code;
      }
    },
    removeFile: (state, action) => {
      return state.filter(file => file.name !== action.payload.name);
    },
    createNewState: (state, action) => {
      return action.payload ;
    },
  },
});

export const { addFile, updateFileCode, removeFile, createNewState } = fileSlice.actions;
export default fileSlice.reducer;
