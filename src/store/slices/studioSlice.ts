import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface Location {
  id: string
  address: string
  district: string
  ward: string
  city: string
  province: string
  latitude: string
  longitude: string
}

interface Category {
  id: string
  name: string
}

interface StudioItem {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  banner: string
  status: string
  category: Category
  locations: Location[]
}

interface ApiResponse {
  statusCode: number
  message: string
  data: {
    data: StudioItem[]
    pagination: {
      current: number
      pageSize: number
      totalPage: number
      totalItem: number
    }
  }
}

interface StudioState {
  studios: StudioItem[]
  loading: boolean
  error: string | null
  pagination: {
    current: number
    pageSize: number
    totalPage: number
    totalItem: number
  } | null
}

const initialState: StudioState = {
  studios: [],
  loading: false,
  error: null,
  pagination: null,
}

// Async thunk for fetching studios
export const fetchStudios = createAsyncThunk(
  "studios/fetchStudios",
  async (params?: { current?: number; pageSize?: number }, { rejectWithValue }) => {
    try {
      const { current = 1, pageSize = 10 } = params || {}
      const response = await fetch(
        `https://api.photogo.id.vn/api/v1/vendors?current=${current}&pageSize=${pageSize}&status=ho%E1%BA%A1t%20%C4%91%E1%BB%99ng&sortBy=created_at&sortDirection=asc`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch studios")
      }

      const result: ApiResponse = await response.json()
      return result.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error")
    }
  },
)

const studioSlice = createSlice({
  name: "studios",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetStudios: (state) => {
      state.studios = []
      state.pagination = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudios.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStudios.fulfilled, (state, action) => {
        state.loading = false
        state.studios = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchStudios.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, resetStudios } = studioSlice.actions
export default studioSlice.reducer
