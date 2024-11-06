import { createSlice } from "@reduxjs/toolkit";

const initialState = "";

const selectedFileSlice = createSlice({
  name: "selectecd file",
  initialState,
  reducers: {
    addSelectedFile: (state, action) => {
      return action.payload;
    },
  },
});

export const { addSelectedFile } = selectedFileSlice.actions;
export default selectedFileSlice.reducer;
