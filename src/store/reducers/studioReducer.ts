import type { StudioState } from "../types/studioTypes"
import {
  FETCH_STUDIOS_REQUEST,
  FETCH_STUDIOS_SUCCESS,
  FETCH_STUDIOS_FAILURE,
  CLEAR_STUDIOS_ERROR,
  RESET_STUDIOS,
} from "../actions/studioActions"

const initialState: StudioState = {
  studios: [],
  loading: false,
  error: null,
  pagination: null,
}

const studioReducer = (state = initialState, action: any): StudioState => {
  switch (action.type) {
    case FETCH_STUDIOS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case FETCH_STUDIOS_SUCCESS:
      return {
        ...state,
        loading: false,
        studios: action.payload.data,
        pagination: action.payload.pagination,
        error: null,
      }

    case FETCH_STUDIOS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case CLEAR_STUDIOS_ERROR:
      return {
        ...state,
        error: null,
      }

    case RESET_STUDIOS:
      return {
        ...state,
        studios: [],
        pagination: null,
      }

    default:
      return state
  }
}

export default studioReducer
