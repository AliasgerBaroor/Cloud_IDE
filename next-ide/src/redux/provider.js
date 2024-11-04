"use client"

import { Provider } from "react-redux"
import { sotre } from "./store"

export const Providers = ({ children }) => {
    return (
        <Provider store={sotre}>
            {children}
        </Provider>
    )
}