import axios from "axios";
import type { LocationAvailabilityResponse, PaymentFormData, VendorData } from "../types/payment"
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define consistent API URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.photogo.id.vn/api/v1';

console.log('PaymentApi using API URL:', API_URL);

// Define the return type for processPayment
interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentStatus: string;
  amount: number;
}

// Helper function to inspect userData structure
const inspectUserData = (userData: any) => {
  console.log('Inspecting userData structure:');
  console.log('- Type:', typeof userData);
  console.log('- Keys:', userData ? Object.keys(userData) : 'null');
  
  // Check for common auth token properties
  const possibleTokenKeys = [
    'accessToken', 'access_token', 'token', 'authToken', 'auth_token', 
    'jwt', 'jwtToken', 'idToken', 'id_token'
  ];
  
  for (const key of possibleTokenKeys) {
    if (userData && userData[key]) {
      console.log(`- Found token in "${key}" property:`, userData[key].substring(0, 15) + '...');
    }
  }
  
  // Check if token might be nested in another object
  for (const key in userData) {
    if (userData[key] && typeof userData[key] === 'object') {
      console.log(`- Checking nested object "${key}"`);
      for (const nestedKey of possibleTokenKeys) {
        if (userData[key][nestedKey]) {
          console.log(`  - Found token in "${key}.${nestedKey}" property:`, 
            userData[key][nestedKey].substring(0, 15) + '...');
        }
      }
    }
  }
};

// API functions
export const paymentApi = {
  // Fetch vendor data by slug
  fetchVendorBySlug: async (slug: string): Promise<VendorData> => {
    try {
      const response = await axios.get(`${API_URL}/vendors/slug/${slug}`);
      const result = response.data;
      
      if (result.statusCode === 200) {
        return result.data
      } else {
        throw new Error(result.message || "Failed to fetch vendor data")
      }
    } catch (error) {
      console.error("Error fetching vendor:", error)
      throw error
    }
  },

  // Fetch vendor data by concept ID
  fetchVendorByConceptId: async (conceptId: string): Promise<VendorData> => {
    try {
      const response = await axios.get(`${API_URL}/vendors/concept/${conceptId}`);
      const result = response.data;
      
      if (result.statusCode === 200) {
        return result.data
      } else {
        throw new Error(result.message || "Failed to fetch vendor data")
      }
    } catch (error) {
      console.error("Error fetching vendor by concept:", error)
      throw error
    }
  },

  // Fetch location availability (general dates and slots)
  fetchLocationAvailability: async (locationId: string): Promise<LocationAvailabilityResponse> => {
    try {
      const response = await axios.get(
        `${API_URL}/location-availability/location/${locationId}?current=1&pageSize=10`,
      )
      const result = await response.data;

      if (result.statusCode === 200) {
        return result
      } else {
        throw new Error(result.message || "Failed to fetch location availability")
      }
    } catch (error) {
      console.error("Error fetching location availability:", error)
      throw error
    }
  },

  // Fetch specific date availability (detailed slot information)
  fetchDateAvailability: async (locationId: string, date: string): Promise<LocationAvailabilityResponse> => {
    try {
      // Convert YYYY-MM-DD to DD/MM/YYYY for API
      const [year, month, day] = date.split("-")
      const formattedDate = `${day}%2F${month}%2F${year}`

      const response = await fetch(
        `${API_URL}/location-availability/location/${locationId}/date?date=${formattedDate}&current=1&pageSize=10`,
      )
      const result = await response.json()

      if (result.statusCode === 200) {
        return result
      } else {
        throw new Error(result.message || "Failed to fetch date availability")
      }
    } catch (error) {
      console.error("Error fetching date availability:", error)
      throw error
    }
  },

  // Step 1: Validate services and calculate pricing
  validateServices: async (services: PaymentFormData["selectedServices"]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          totalPrice: 6500000,
          availableVouchers: ["discount10", "discount15"],
        })
      }, 1000)
    })
  },

  // Step 2: Save customer information
  saveCustomerInfo: async (customerInfo: PaymentFormData["customerInfo"]) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (customerInfo.email && customerInfo.name && customerInfo.phone) {
          resolve({
            success: true,
            customerId: "CUST_" + Date.now(),
          })
        } else {
          reject(new Error("Missing required customer information"))
        }
      }, 1000)
    })
  },

  // Step 3: Process payment
  processPayment: async (paymentData: PaymentFormData): Promise<PaymentResult> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate payment processing
        if (paymentData.paymentMethod === "card" && !paymentData.cardDetails.number) {
          reject(new Error("Invalid card details"))
          return
        }

        let total = paymentData.selectedConcept
          ? Number.parseFloat(paymentData.selectedConcept.price)
          : 6500000
        const paymentAmount = Math.round((total * Number.parseInt(paymentData.paymentOption)) / 100)

        resolve({
          success: true,
          transactionId: "TXN_" + Date.now(),
          paymentStatus: "completed",
          amount: paymentAmount,
        })
      }, 2000)
    })
  },

  // Fetch user vouchers
  fetchUserVouchers: async (userId: string, page = 1, pageSize = 10): Promise<any> => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }
      
      const headers = {
        'Authorization': `Bearer ${accessToken}`
      };
      
      const response = await axios.get(
        `${API_URL}/vouchers/user/${userId}?current=${page}&pageSize=${pageSize}&from=chi%E1%BA%BFn%20d%E1%BB%8Bch&status=c%C3%B3%20s%E1%BA%B5n&sortBy=maxPrice&sortDirection=desc`, 
        { headers }
      );
      
      if (response.data.statusCode === 200) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch user vouchers");
      }
    } catch (error) {
      console.error("Error fetching user vouchers:", error);
      throw error;
    }
  },

  // Create booking and get payment link
  createBooking: async (paymentData: PaymentFormData) => {
    try {
      console.log('Creating booking with payment data:', paymentData);
      
      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : {};
      
      // Get access token
      const accessToken = await AsyncStorage.getItem('access_token') || userData?.access_token || userData?.accessToken;
      
      if (!accessToken) {
        console.warn('No access token available for authentication');
        throw new Error('Authentication token not found');
      }
      
      // Format date from YYYY-MM-DD to DD/MM/YYYY
      const bookingDate = paymentData.bookingDateTime?.date 
        ? paymentData.bookingDateTime.date.split('-').reverse().join('/') 
        : '';
      
      // Prepare request body - only include fields that have values
      const requestBody: Record<string, any> = {
        bookingType: paymentData.bookingType || "một ngày"
      };
      
      // Only add fields that have values
      if (paymentData.bookingType === 'nhiều ngày' && paymentData.bookingDateTime?.dates && paymentData.bookingDateTime.dates.length > 0) {
        // Multi-day: send schedules as array, do not send date/time
        requestBody.schedules = paymentData.bookingDateTime.dates.map(d => d.split('-').reverse().join('/'));
      } else {
        if (bookingDate) requestBody.date = bookingDate;
        if (paymentData.bookingDateTime?.time) requestBody.time = paymentData.bookingDateTime.time;
        if (bookingDate) requestBody.schedules = [bookingDate];
      }
      
      requestBody.sourceType = "chiến dịch";
      
      if (paymentData.vendorData?.locations?.[0]?.id) {
        requestBody.locationId = paymentData.vendorData.locations[0].id;
      }
      
      if (paymentData.paymentOption) {
        requestBody.depositAmount = parseInt(paymentData.paymentOption);
        requestBody.depositType = "phần trăm";
      }
      
      requestBody.userNote = "Không có";
      
      if (paymentData.customerInfo.name) requestBody.fullName = paymentData.customerInfo.name;
      if (paymentData.customerInfo.phone) requestBody.phone = paymentData.customerInfo.phone;
      if (paymentData.customerInfo.email) requestBody.email = paymentData.customerInfo.email;
      
      // Send voucher_id instead of voucherCode
      if (paymentData.voucherCode) requestBody.voucherId = paymentData.voucherCode;
      
      console.log('Request body for booking:', requestBody);
      
      // Set up headers with access token
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      };
      
      // Make API request
      const serviceConceptId = paymentData.selectedConcept?.id || "";
      const userId = userData?.id || "";
      const response = await axios.post(
        `${API_URL}/bookings?userId=${userId}&serviceConceptId=${serviceConceptId}`,
        requestBody,
        { headers }
      );
      
      console.log('Booking response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error("Error creating booking:");
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      
      throw error;
    }
  },

  // Get order summary
  getOrderSummary: async (orderId: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId,
          status: "confirmed",
          totalAmount: 6500000,
          paidAmount: 1950000,
          remainingAmount: 4550000,
        })
      }, 500)
    })
  },
}
