"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from "react-native"
import type { StepProps } from "../../../types/payment"

const theme = {
  colors: {
    primary: "#f6ac69",
    secondary: "#E9D8FD",
    background: "#fdfcff",
    text: "#2D3748",
    lightText: "#A0AEC0",
  },
}

export default function Step2({ formData, onUpdateFormData, onNext, onBack, isLoading }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ"
  }

  const basePrice = 6500000

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
      onNext()
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Họ và tên *</Text>
          <TextInput
            style={[styles.textInput, errors.name && styles.textInputError]}
            placeholder="Nguyễn Văn A"
            value={formData.customerInfo.name}
            onChangeText={(text) => updateCustomerInfo("name", text)}
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
            <Text style={styles.summaryValue}>{formatPrice(basePrice)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Tổng cộng</Text>
            <Text style={styles.summaryTotalValue}>{formatPrice(basePrice)}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onBack} style={styles.secondaryButton} disabled={isLoading}>
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            disabled={isLoading}
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.buttonDisabled,
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
  inputGroup: {
    gap: 8,
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
    paddingTop: 16,
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
