import { axiosClient } from "../config/config";
import type { ApiResponse } from "../store/types/studioTypes"

export const fetchStudiosApi = async (params?: { current?: number; pageSize?: number }): Promise<ApiResponse> => {
  const { current = 1, pageSize = 10 } = params || {}

  const response = await fetch(
    `/vendors?current=${current}&pageSize=${pageSize}&status=ho%E1%BA%A1t%20%C4%91%E1%BB%99ng&sortBy=created_at&sortDirection=asc`,
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}


const VendorService = {
    async getVendorFilter(params = {}) {
        return axiosClient.get(`/`, { params });
    },
};

export default VendorService;