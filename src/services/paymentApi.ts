import axios from "axios";
import type { LocationAvailabilityResponse, PaymentFormData, VendorData } from "../types/payment"

// API functions
export const paymentApi = {
  // Fetch vendor data by slug
  fetchVendorBySlug: async (slug: string): Promise<VendorData> => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/vendors/slug/${slug}`);
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

  // Fetch location availability (general dates and slots)
  fetchLocationAvailability: async (locationId: string): Promise<LocationAvailabilityResponse> => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/location-availability/location/${locationId}?current=1&pageSize=10`,
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
        `${process.env.EXPO_PUBLIC_API_URL}/location-availability/location/${locationId}/date?date=${formattedDate}&current=1&pageSize=10`,
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
  processPayment: async (paymentData: PaymentFormData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate payment processing
        if (paymentData.paymentMethod === "card" && !paymentData.cardDetails.number) {
          reject(new Error("Invalid card details"))
          return
        }

        const conceptPrice = paymentData.selectedConcept
          ? Number.parseFloat(paymentData.selectedConcept.price)
          : 6500000
        const paymentAmount = Math.round((conceptPrice * Number.parseInt(paymentData.paymentOption)) / 100)

        resolve({
          success: true,
          transactionId: "TXN_" + Date.now(),
          paymentStatus: "completed",
          amount: paymentAmount,
        })
      }, 2000)
    })
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
