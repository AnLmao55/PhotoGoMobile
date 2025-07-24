"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from "react-native"
import type { StepProps } from "../../../types/payment"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useUserProfile } from "../../../contexts/UserProfileContext"

const theme = {
  colors: {
    primary: "#f6ac69",
    secondary: "#E9D8FD",
    background: "#fdfcff",
    text: "#2D3748",
    lightText: "#A0AEC0",
  },
}

// Use a different key to avoid conflicts with login userData
const BOOKING_USER_DATA_KEY = "bookingUserData"

export default function Step3({ formData, onUpdateFormData, onNext, onBack, isLoading }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoadingUserData, setIsLoadingUserData] = useState(false)
  const { userProfile } = useUserProfile()

  // Use userProfile data from context to fill the form
  useEffect(() => {
    if (userProfile) {
      setIsLoadingUserData(true)
      
      // Update form data with user profile data from context
      onUpdateFormData({
        customerInfo: {
          ...formData.customerInfo,
          name: userProfile.fullName || formData.customerInfo.name,
          email: userProfile.email || formData.customerInfo.email,
          phone: userProfile.phoneNumber || formData.customerInfo.phone,
        },
      })
      
      setIsLoadingUserData(false)
    }
  }, [userProfile])

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ"
  }

  const calculateTotal = () => {
    return formData.selectedConcept ? Number.parseFloat(formData.selectedConcept.price) : 0
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerInfo.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên"
    }

    if (!formData.customerInfo.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.customerInfo.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.customerInfo.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10,11}$/.test(formData.customerInfo.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      // Save user data to AsyncStorage for future use
      const userDataToSave = JSON.stringify({
        name: formData.customerInfo.name,
        email: formData.customerInfo.email,
        phone: formData.customerInfo.phone,
      })
      
      AsyncStorage.setItem(BOOKING_USER_DATA_KEY, userDataToSave)
        .then(() => onNext())
        .catch(error => {
          console.error('Error saving user data:', error)
          onNext() // Continue anyway even if saving fails
        })
    } else {
      Alert.alert("Lỗi", "Vui lòng kiểm tra lại thông tin đã nhập")
    }
  }

  const updateCustomerInfo = (field: keyof typeof formData.customerInfo, value: string) => {
    onUpdateFormData({
      customerInfo: {
        ...formData.customerInfo,
        [field]: value,
      },
    })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const formatDateTime = () => {
    if (!formData.bookingDateTime) return "";
    if (formData.bookingDateTime.dates && formData.bookingDateTime.dates.length > 0) {
      // Multi-day: show all dates
      return formData.bookingDateTime.dates.map(date => date.split("-").reverse().join("/")).join(", ");
    }
    const { date, time } = formData.bookingDateTime;
    const formattedDate = date.split("-").reverse().join("/");
    return `${formattedDate} lúc ${time}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Selected Concept Summary */}
        {formData.selectedConcept && (
          <View style={styles.selectedConceptCard}>
            <Text style={styles.selectedConceptTitle}>Gói đã chọn</Text>
            <Text style={styles.selectedConceptName}>{formData.selectedConcept.name}</Text>
            <Text style={[styles.selectedConceptPrice, { color: theme.colors.primary }]}>
              {formatPrice(Number.parseFloat(formData.selectedConcept.price))}
            </Text>
            {formData.bookingDateTime && (
              <Text style={styles.selectedDateTime}>📅 {formatDateTime()}</Text>
            )}
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Họ và tên *</Text>
          <TextInput
            style={[styles.textInput, errors.name && styles.textInputError]}
            placeholder="Nguyễn Văn A"
            value={formData.customerInfo.name}
            onChangeText={(text) => updateCustomerInfo("name", text)}
            editable={!isLoadingUserData}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput
            style={[styles.textInput, errors.email && styles.textInputError]}
            placeholder="nguyenvana@example.com"
            value={formData.customerInfo.email}
            onChangeText={(text) => updateCustomerInfo("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoadingUserData}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số điện thoại *</Text>
          <TextInput
            style={[styles.textInput, errors.phone && styles.textInputError]}
            placeholder="0901234567"
            value={formData.customerInfo.phone}
            onChangeText={(text) => updateCustomerInfo("phone", text)}
            keyboardType="phone-pad"
            editable={!isLoadingUserData}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ghi chú</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt (nếu có)"
            value={formData.customerInfo.notes}
            onChangeText={(text) => updateCustomerInfo("notes", text)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(calculateTotal())}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Tổng cộng</Text>
            <Text style={styles.summaryTotalValue}>{formatPrice(calculateTotal())}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onBack} style={styles.secondaryButton} disabled={isLoading || isLoadingUserData}>
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            disabled={isLoading || isLoadingUserData}
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
              (isLoading || isLoadingUserData) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>{isLoading ? "Đang xử lý..." : "Tiếp tục →"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  selectedConceptCard: {
    backgroundColor: "#fef3e2",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f6ac69",
  },
  selectedConceptTitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  selectedConceptName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  selectedConceptPrice: {
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 8,
  },
  selectedDateTime: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontWeight: "500",
    fontSize: 16,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    fontSize: 16,
  },
  textInputError: {
    borderColor: "#ef4444",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  summaryTotalLabel: {
    fontWeight: "600",
    fontSize: 18,
  },
  summaryTotalValue: {
    fontWeight: "600",
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
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
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
