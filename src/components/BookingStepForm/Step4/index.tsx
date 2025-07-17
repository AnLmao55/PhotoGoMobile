"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Linking } from "react-native"
import type { StepProps } from "../../../types/payment"
import { Ionicons } from "@expo/vector-icons"
import { paymentApi } from "../../../services/paymentApi"
import { useNavigation, NavigationProp } from '@react-navigation/native'

type RootStackParamList = {
  UserProfileScreen: undefined;
  MyOrder: undefined;
  MainTabs: { screen: string } | undefined;
  // Add other screens as needed
};

const theme = {
  colors: {
    primary: "#f6ac69",
    secondary: "#E9D8FD",
    background: "#fdfcff",
    text: "#2D3748",
    lightText: "#A0AEC0",
  },
}

export default function Step4({ formData, onUpdateFormData, onNext, onBack, isLoading }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processingPayment, setProcessingPayment] = useState(false)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ"
  }

  const calculateTotal = () => {
    let total = formData.selectedConcept ? Number.parseFloat(formData.selectedConcept.price) : 0
    if (formData.selectedServices.premium) total += 1500000
    if (formData.selectedServices.album) total += 1200000
    if (formData.selectedServices.extraHour) total += 800000
    return total
  }

  const getPaymentAmount = () => {
    const total = calculateTotal()
    const percentage = Number.parseInt(formData.paymentOption)
    return Math.round((total * percentage) / 100)
  }

  const handlePayment = async () => {
    try {
      setProcessingPayment(true)

      // Call the new createBooking API instead of onNext
      const response = await paymentApi.createBooking(formData)
      
      // Check if we have a payment link in the response
      if (response && response.data && response.data.paymentLink) {
        // Open the payment link in a new browser tab
        await Linking.openURL(response.data.paymentLink)
        
        // Navigate to the "Hồ sơ" tab in MainTabs
        navigation.navigate('MainTabs', { screen: 'Hồ sơ' });
      } else {
        Alert.alert("Lỗi", "Không tìm thấy đường dẫn thanh toán")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi xử lý thanh toán"
      Alert.alert("Lỗi", errorMessage)
    } finally {
      setProcessingPayment(false)
    }
  }

  const updatePaymentOption = (option: string) => {
    onUpdateFormData({ paymentOption: option })
  }

  const formatDateTime = () => {
    if (!formData.bookingDateTime) return ""
    const { date, time } = formData.bookingDateTime
    const formattedDate = date.split("-").reverse().join("/")
    return `${formattedDate} lúc ${time}`
  }

  const totalAmount = calculateTotal()
  // Calculate discount (example: 20% off)
  const discount = 0 // percentage
  const discountAmount = Math.round((totalAmount * discount) / 100)
  const finalAmount = totalAmount - discountAmount

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Ionicons name="card-outline" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
        </View>
        <Text style={styles.headerSubtitle}>Chọn phương thức thanh toán phù hợp với bạn</Text>

       {/* Deposit Options */}
       <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn mức đặt cọc</Text>
          <View style={styles.depositOptions}>
            {[
              { value: "30", label: "30%", amount: Math.round(finalAmount * 0.3) },
              { value: "50", label: "50%", amount: Math.round(finalAmount * 0.5) },
              { value: "70", label: "70%", amount: Math.round(finalAmount * 0.7) },
              { value: "100", label: "100%", amount: finalAmount, isSelected: true },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => updatePaymentOption(option.value)}
                style={[
                  styles.depositOption,
                  formData.paymentOption === option.value && styles.selectedDepositOption,
                ]}
              >
                <View style={styles.depositPercentage}>
                  <Text style={[
                    styles.depositPercentageText,
                    formData.paymentOption === option.value && styles.selectedDepositPercentageText
                  ]}>
                    {option.label}
                  </Text>
                </View>
                <Text style={[
                  styles.depositText,
                  formData.paymentOption === option.value && styles.selectedDepositText
                ]}>
                  {option.value === "100" ? "Thanh toán đủ" : "Đặt cọc"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="star-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.summaryHeaderText}>Tóm tắt đơn hàng</Text>
          </View>

          <View style={styles.bookingDetails}>
            <Image 
              source={{ uri: formData.selectedConcept?.images?.[0] || "https://via.placeholder.com/100" }} 
              style={styles.conceptImage} 
            />
            <View style={styles.bookingInfo}>
              <Text style={styles.conceptName}>{formData.selectedConcept?.name || "Concept Chụp Ảnh"}</Text>
              <View style={styles.conceptType}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.conceptTypeText}>Concept {formData.selectedConcept?.name?.split(" ")[0] || "Picnic"}</Text>
              </View>
              <View style={styles.dateTimeRow}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.dateTimeText}>{formatDateTime()}</Text>
              </View>
            </View>
          </View>

          {/* Discount Section */}
          <View style={styles.discountSection}>
            <View style={styles.discountBadge}>
              <Ionicons name="pricetag-outline" size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.discountInfo}>
              <Text style={styles.discountTitle}>Mã giảm giá</Text>
              <Text style={styles.discountCode}>GiamGia20 - {discount}.00%</Text>
            </View>
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          {/* Price Summary */}
          <View style={styles.priceSummary}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tạm tính</Text>
              <Text style={styles.priceValue}>{formatPrice(totalAmount)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giảm giá</Text>
              <Text style={styles.discountValue}>-{formatPrice(discountAmount)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.depositLabel}>Đặt cọc ({formData.paymentOption}%)</Text>
              <Text style={styles.depositValue}>-{formatPrice(getPaymentAmount())}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.remainingLabel}>Số tiền còn lại</Text>
              <Text style={styles.remainingValue}>{formatPrice(finalAmount - getPaymentAmount())}</Text>
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#4CAF50" />
            <Text style={styles.securityText}>Thanh toán an toàn & bảo mật</Text>
          </View>
          <Text style={styles.cancellationPolicy}>
            Bạn có thể hủy đặt lịch miễn phí trước 48 giờ. Sau thời gian này, số tiền đặt cọc sẽ không được hoàn lại.
          </Text>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
          <View style={styles.paymentMethod}>
            <View style={styles.radioButton}>
              <View style={styles.radioButtonInner} />
            </View>
            <View style={styles.payosLogoContainer}>
              <Image 
                source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzyLwczXxezKsQjX4t5uvXGWDvlwwOwuX-1A&s" }} 
                style={styles.payosLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.paymentMethodText}>Thanh toán qua ví PayOS</Text>
          </View>
        </View>

        {/* Deposit Policy */}
        <View style={styles.depositPolicySection}>
          <Text style={styles.depositPolicyTitle}>Chính sách đặt cọc</Text>
          <View style={styles.policyItem}>
            <View style={styles.policyBullet} />
            <Text style={styles.policyText}>Đặt cọc tối thiểu 30% để xác nhận lịch hẹn</Text>
          </View>
          <View style={styles.policyItem}>
            <View style={styles.policyBullet} />
            <Text style={styles.policyText}>Số tiền đặt cọc sẽ được trừ vào tổng giá trị dịch vụ</Text>
          </View>
          <View style={styles.policyItem}>
            <View style={styles.policyBullet} />
            <Text style={styles.policyText}>Số tiền còn lại sẽ được thanh toán vào ngày thực hiện dịch vụ</Text>
          </View>
          <View style={styles.policyItem}>
            <View style={styles.policyBullet} />
            <Text style={styles.policyText}>Đặt cọc 100% sẽ được ưu tiên lịch hẹn và được giảm 5% tổng hóa đơn</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onBack} style={styles.secondaryButton} disabled={processingPayment || isLoading}>
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePayment}
            disabled={processingPayment || isLoading}
            style={[
              styles.primaryButton,
              (processingPayment || isLoading) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>{(processingPayment || isLoading) ? "Đang thanh toán..." : "Tiếp tục"}</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
    gap: 24,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bookingDetails: {
    flexDirection: "row",
    marginBottom: 16,
  },
  conceptImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
    justifyContent: "center",
  },
  conceptName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  conceptType: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  conceptTypeText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  discountSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  discountBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  discountInfo: {
    flex: 1,
  },
  discountTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  discountCode: {
    fontSize: 12,
    color: "#6B7280",
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "500",
  },
  priceSummary: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 14,
  },
  discountValue: {
    fontSize: 14,
    color: "#EF4444",
  },
  depositLabel: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  depositValue: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  remainingLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  remainingValue: {
    fontSize: 14,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: "#4CAF50",
    marginLeft: 6,
  },
  cancellationPolicy: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  depositOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  depositOption: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  selectedDepositOption: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: "#FEF3C7",
  },
  depositPercentage: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  depositPercentageText: {
    fontSize: 18,
    fontWeight: "700",
  },
  selectedDepositPercentageText: {
    color: theme.colors.primary,
  },
  depositText: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectedDepositText: {
    color: theme.colors.primary,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    padding: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  payosLogoContainer: {
    marginRight: 12,
  },
  payosLogo: {
    height: 50,
    width: 120,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: "500",
  },
  depositPolicySection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  depositPolicyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  policyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  policyBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  policyText: {
    fontSize: 14,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2D3748",
    fontSize: 16,
    fontWeight: "500",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
