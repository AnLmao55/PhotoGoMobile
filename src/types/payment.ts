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

export interface BookingDateTime {
  date: string // YYYY-MM-DD format
  time: string // HH:MM format
  slotId?: string // API slot ID
  dates?: string[] // For multi-day concepts
}

export interface ServiceConcept {
  id: string
  name: string
  description: string
  images: string[]
  price: string
  duration: number
  serviceTypes: Array<{
    id: string
    name: string
    description: string
  }>
  conceptRangeType?: string // 'một ngày' | 'nhiều ngày'
  numberOfDays?: number
}

export interface ServicePackage {
  id: string
  name: string
  description: string
  image: string
  status: string
  vendorId: string
  serviceConcepts: ServiceConcept[]
  created_at: string
  updated_at: string
}

export interface VendorData {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  banner: string
  status: string
  category: {
    id: string
    name: string
  }
  locations: Array<{
    id: string
    address: string
    district: string
    ward: string
    city: string
    province: string
    latitude: string
    longitude: string
  }>
  servicePackages: ServicePackage[]
  totalPrice: number
  averageRating: number
}

// User profile data to pass to booking form
export interface UserProfileData {
  fullName?: string
  email?: string
  phoneNumber?: string
}

export interface PaymentFormData {
  selectedServices: ServiceSelection
  voucher: string
  voucherCode?: string
  customerInfo: CustomerInfo
  paymentOption: string
  paymentMethod: string
  cardDetails: CardDetails
  selectedConcept?: ServiceConcept
  bookingDateTime?: BookingDateTime
  vendorData?: VendorData
  bookingType?: string // 'một ngày' | 'nhiều ngày'
}

export interface StepProps {
  formData: PaymentFormData
  onUpdateFormData: (data: Partial<PaymentFormData>) => void
  onNext: () => void
  onBack: () => void
  isLoading?: boolean
  vendorData?: VendorData
  userProfileData?: UserProfileData // Add user profile data
}

// API Response Types
export interface WorkingDate {
  id: string
  date: string // DD/MM/YYYY format from API
  isAvailable: boolean
}

export interface SlotTime {
  id: string
  slot: number
  startSlotTime: string // HH:MM:SS format
  endSlotTime: string // HH:MM:SS format
  isStrictTimeBlocking: boolean
}

export interface SlotTimeWorkingDate {
  id: string
  date: string // DD/MM/YYYY format
  startSlotTime: string // HH:MM:SS format
  endSlotTime: string // HH:MM:SS format
  maxParallelBookings: number
  alreadyBooked: number
  isAvailable: boolean
}

export interface Voucher {
  voucher_id: string
  user_id: string
  status: string
  from: string
  assigned_at: string
  used_at: string | null
  user: {
    id: string
    email: string
    fullName: string
    // Other user fields...
  }
  voucher: {
    id: string
    code: string
    description: string
    discount_type: string
    discount_value: string
    minPrice: number
    maxPrice: number
    quantity: number
    usedCount: number
    type: string
    point: number
    start_date: string
    end_date: string
    status: string
    created_at: string
    updated_at: string
  }
  is_valid: boolean
}

export interface VoucherResponse {
  statusCode: number
  message: string
  data: {
    data: Voucher[]
    pagination: {
      current: number
      pageSize: number
      totalPage: number
      totalItem: number
    }
  }
}

export interface LocationAvailability {
  id: string
  startTime: string // HH:MM:SS format
  endTime: string // HH:MM:SS format
  isAvailable: boolean
  createdAt: string
  updatedAt: string
  location: {
    id: string
    address: string
    district: string
    ward: string
    city: string
    province: string
    latitude: string
    longitude: string
    createdAt: string
    updatedAt: string
  }
  workingDates: WorkingDate[]
  slotTimes: SlotTime[]
  slotTimeWorkingDates: SlotTimeWorkingDate[]
}

export interface LocationAvailabilityResponse {
  statusCode: number
  message: string
  data: {
    data: LocationAvailability[]
    pagination: {
      current: number
      pageSize: number
      totalPage: number
      totalItem: number
    }
  }
}
