import type { StudioItem } from "../types/studioTypes"

// Action Types
export const FETCH_STUDIOS_REQUEST = "FETCH_STUDIOS_REQUEST"
export const FETCH_STUDIOS_SUCCESS = "FETCH_STUDIOS_SUCCESS"
export const FETCH_STUDIOS_FAILURE = "FETCH_STUDIOS_FAILURE"
export const CLEAR_STUDIOS_ERROR = "CLEAR_STUDIOS_ERROR"
export const RESET_STUDIOS = "RESET_STUDIOS"

// Action Creators
export const fetchStudiosRequest = () => ({
  type: FETCH_STUDIOS_REQUEST,
})

export const fetchStudiosSuccess = (data: {
  data: StudioItem[]
  pagination: {
    current: number
    pageSize: number
    totalPage: number
    totalItem: number
  }
}) => ({
  type: FETCH_STUDIOS_SUCCESS,
  payload: data,
})

export const fetchStudiosFailure = (error: string) => ({
  type: FETCH_STUDIOS_FAILURE,
  payload: error,
})

export const clearStudiosError = () => ({
  type: CLEAR_STUDIOS_ERROR,
})

export const resetStudios = () => ({
  type: RESET_STUDIOS,
})
