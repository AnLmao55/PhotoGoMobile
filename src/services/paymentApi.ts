import type { PaymentFormData } from "../types/payment"

// Mock API functions - replace with your actual API endpoints
export const paymentApi = {
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

        resolve({
          success: true,
          transactionId: "TXN_" + Date.now(),
          paymentStatus: "completed",
          amount: Math.round((6500000 * Number.parseInt(paymentData.paymentOption)) / 100),
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
