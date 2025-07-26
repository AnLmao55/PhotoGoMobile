import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

interface VoucherResponse {
  statusCode: number;
  message: string;
  data: {
    data: Voucher[];
    pagination: {
      current: number;
      pageSize: number;
      totalPage: number;
      totalItem: number;
    };
  };
}

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: string;
  minPrice: number;
  maxPrice: number;
  quantity: number;
  usedCount: number;
  type: string;
  point: number;
  start_date: string;
  end_date: string;
  status: string;
}

export interface UserVoucher {
  id: string;
  voucherId: string;
  userId: string;
  status: string;
  used: boolean;
  usedDate?: string;
  createdAt: string;
  updatedAt: string;
  voucher: Voucher;
}

interface UserVouchersResponse {
  statusCode: number;
  message: string;
  data: {
    data: UserVoucher[];
    pagination: {
      current: number;
      pageSize: number;
      totalPage: number;
      totalItem: number;
    };
  };
}

interface ClaimVoucherResponse {
  statusCode: number;
  message: string;
  data: UserVoucher;
}

const getHeaders = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('access_token');
    console.log('Access token for API calls:', accessToken ? 'Found' : 'Not found');
    
    if (!accessToken) {
      throw new Error('Access token not found');
    }
    
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error getting headers:', error);
    throw error;
  }
};

export const voucherService = {
  // Get all available vouchers
  getVouchers: async (page: number = 1, pageSize: number = 10): Promise<VoucherResponse> => {
    try {
      console.log(`Fetching vouchers: page=${page}, pageSize=${pageSize}`);
      const response = await axios.get(
        `${API_URL}/vouchers?current=${page}&pageSize=${pageSize}&discountType=ph%E1%BA%A7n%20tr%C4%83m&type=chi%E1%BA%BFn%20d%E1%BB%8Bch&status=active&sortBy=maxPrice&sortDirection=desc`
      );
      console.log('Vouchers API response status:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('Error in getVouchers:', error.message);
      if (error.response) {
        console.error('Response error data:', error.response.data);
      }
      throw error;
    }
  },

  // Get user's vouchers
  getUserVouchers: async (userId: string, page: number = 1, pageSize: number = 10): Promise<UserVouchersResponse> => {
    try {
      if (!userId || userId === 'unknown') {
        throw new Error('Invalid user ID');
      }
      
      console.log(`Fetching user vouchers: userId=${userId}, page=${page}`);
      const headers = await getHeaders();
      const response = await axios.get(
        `${API_URL}/vouchers/user/${userId}?current=${page}&pageSize=${pageSize}&from=chi%E1%BA%BFn%20d%E1%BB%8Bch&status=c%C3%B3%20s%E1%BA%B5n&sortBy=maxPrice&sortDirection=desc`,
        headers
      );
      console.log('User vouchers API response status:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('Error in getUserVouchers:', error.message);
      if (error.response) {
        console.error('Response error data:', error.response.data);
      }
      throw error;
    }
  },

  // Claim a voucher
  claimVoucher: async (userId: string, voucherId: string): Promise<ClaimVoucherResponse> => {
    try {
      if (!userId || userId === 'unknown') {
        throw new Error('Invalid user ID');
      }
      
      if (!voucherId) {
        throw new Error('Invalid voucher ID');
      }
      
      console.log(`Claiming voucher: userId=${userId}, voucherId=${voucherId}`);
      const headers = await getHeaders();
      
      // Dựa vào thông báo lỗi, API không chấp nhận trường userId và voucherId
      // Gửi request không có body hoặc chỉ gửi các trường mà API yêu cầu
      // Sử dụng URL để truyền các tham số thay vì body
      const response = await axios.post(
        `${API_URL}/vouchers/user?userId=${userId}&voucherId=${voucherId}`, 
        {}, // empty body
        headers
      );
      
      console.log('Claim voucher API response status:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('Error in claimVoucher:', error.message);
      if (error.response) {
        console.error('Response error data:', error.response.data);
      }
      throw error;
    }
  },

  // Check if user already has a voucher
  checkIfUserHasVoucher: async (userId: string, voucherId: string): Promise<boolean> => {
    try {
      if (!userId || userId === 'unknown') {
        throw new Error('Invalid user ID');
      }
      
      const userVouchers = await voucherService.getUserVouchers(userId, 1, 100);
      return userVouchers.data.data.some(uv => uv.voucherId === voucherId);
    } catch (error) {
      console.error("Error checking if user has voucher:", error);
      return false;
    }
  }
}; 