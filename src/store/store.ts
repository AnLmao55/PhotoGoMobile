import { createStore } from "redux"
import studioReducer from "./reducers/studioReducer"

// Simple store without middleware
const store = createStore(studioReducer)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
