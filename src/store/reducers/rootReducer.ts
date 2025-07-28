import { combineReducers } from "redux"
import studioReducer from "./studioReducer"

const rootReducer = combineReducers({
  studios: studioReducer,
  // Add other reducers here
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
