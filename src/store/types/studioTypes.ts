export interface Location {
  id: string
  address: string
  district: string
  ward: string
  city: string
  province: string
  latitude: string
  longitude: string
}

export interface Category {
  id: string
  name: string
}

export interface StudioItem {
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

export interface ApiResponse {
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

export interface StudioState {
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

export interface FetchStudiosPayload {
  current?: number
  pageSize?: number
}
