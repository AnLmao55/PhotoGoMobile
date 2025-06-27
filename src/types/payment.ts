export interface ServiceSelection {
    premium: boolean
    album: boolean
    extraHour: boolean
  }
  
  export interface CustomerInfo {
    name: string
    email: string
    phone: string
    notes: string
  }
  
  export interface CardDetails {
    number: string
    expiry: string
    cvv: string
    name: string
  }
  
  export interface PaymentFormData {
    selectedServices: ServiceSelection
    voucher: string
    customerInfo: CustomerInfo
    paymentOption: string
    paymentMethod: string
    cardDetails: CardDetails
  }
  
  export interface StepProps {
    formData: PaymentFormData
    onUpdateFormData: (data: Partial<PaymentFormData>) => void
    onNext: () => void
    onBack: () => void
    isLoading?: boolean
  }
  