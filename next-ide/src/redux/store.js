import { configureStore } from "@reduxjs/toolkit";
import file from "./file_slice";

export const sotre = configureStore({
    reducer : {
         file : file,
    }
   
})