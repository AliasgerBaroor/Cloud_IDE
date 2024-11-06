import { configureStore } from "@reduxjs/toolkit";
import file from "./file_slice";
import selectedFile from "./selected_file_slice";

export const sotre = configureStore({
    reducer : {
         file,
         selectedFile,
    }
   
})