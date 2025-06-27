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

const RadioButton = ({ selected, onPress }: { selected: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.radioButton}>
    <View style={[styles.radioButtonInner, selected && styles.radioButtonSelected]}>
      {selected && <View style={styles.radioButtonDot} />}
    </View>
  </TouchableOpacity>
)

export default function Step3({ formData, onUpdateFormData, onNext, onBack, isLoading }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ"
  }

  const basePrice = 6500000

  const getPaymentAmount = () => {
    const percentage = Number.parseInt(formData.paymentOption)
    return Math.round((basePrice * percentage) / 100)
  }

  const validateCardDetails = () => {
    if (formData.paymentMethod !== "card") return true

    const newErrors: Record<string, string> = {}

    if (!formData.cardDetails.number.trim()) {
      newErrors.cardNumber = "Vui lòng nhập số thẻ"
    } else if (formData.cardDetails.number.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "Số thẻ không hợp lệ"
    }

    if (!formData.cardDetails.expiry.trim()) {
      newErrors.expiry = "Vui lòng nhập ngày hết hạn"
    } else if (!/^\d{2}\/\d{2}$/.test(formData.cardDetails.expiry)) {
      newErrors.expiry = "Định dạng MM/YY"
    }

    if (!formData.cardDetails.cvv.trim()) {
      newErrors.cvv = "Vui lòng nhập CVV"
    } else if (formData.cardDetails.cvv.length < 3) {
      newErrors.cvv = "CVV không hợp lệ"
    }

    if (!formData.cardDetails.name.trim()) {
      newErrors.cardName = "Vui lòng nhập tên chủ thẻ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateCardDetails()) {
      Alert.alert("Lỗi", "Vui lòng kiểm tra lại thông tin thẻ")
      return
    }

    try {
      // Call API here
      await onNext()
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi xử lý thanh toán")
    }
  }

  const updatePaymentOption = (option: string) => {
    onUpdateFormData({ paymentOption: option })
  }

  const updatePaymentMethod = (method: string) => {
    onUpdateFormData({ paymentMethod: method })
    setErrors({}) // Clear card errors when switching payment method
  }

  const updateCardDetails = (field: keyof typeof formData.cardDetails, value: string) => {
    onUpdateFormData({
      cardDetails: {
        ...formData.cardDetails,
        [field]: value,
      },
    })

    // Clear error when user starts typing
    const errorKey = field === "number" ? "cardNumber" : field === "name" ? "cardName" : field
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }))
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Payment Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn mức đặt cọc</Text>
          <View style={styles.optionList}>
            {[
              { value: "30", label: "Đặt cọc 30%", amount: Math.round(basePrice * 0.3) },
              { value: "50", label: "Đặt cọc 50%", amount: Math.round(basePrice * 0.5) },
              { value: "100", label: "Thanh toán 100%", amount: basePrice },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => updatePaymentOption(option.value)}
                style={[
                  styles.optionItem,
                  {
                    borderColor: formData.paymentOption === option.value ? theme.colors.primary : "#e5e7eb",
                    borderWidth: formData.paymentOption === option.value ? 2 : 1,
                  },
                ]}
              >
                <RadioButton
                  selected={formData.paymentOption === option.value}
                  onPress={() => updatePaymentOption(option.value)}
                />
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionPrice}>{formatPrice(option.amount)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.optionList}>
            {[
              { value: "card", icon: "💳", title: "Thẻ tín dụng / Ghi nợ", subtitle: "Visa, Mastercard, JCB" },
              { value: "momo", icon: "📱", title: "Ví điện tử MoMo", subtitle: "Thanh toán qua ví MoMo" },
              {
                value: "bank",
                icon: "🏦",
                title: "Chuyển khoản ngân hàng",
                subtitle: "Chuyển khoản trực tiếp đến tài khoản của chúng tôi",
              },
            ].map((method) => (
              <TouchableOpacity
                key={method.value}
                onPress={() => updatePaymentMethod(method.value)}
                style={[
                  styles.optionItem,
                  {
                    borderColor: formData.paymentMethod === method.value ? theme.colors.primary : "#e5e7eb",
                    borderWidth: formData.paymentMethod === method.value ? 2 : 1,
                  },
                ]}
              >
                <RadioButton
                  selected={formData.paymentMethod === method.value}
                  onPress={() => updatePaymentMethod(method.value)}
                />
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Card Details */}
        {formData.paymentMethod === "card" && (
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số thẻ *</Text>
              <TextInput
                style={[styles.textInput, errors.cardNumber && styles.textInputError]}
                placeholder="1234 5678 9012 3456"
                value={formData.cardDetails.number}
                onChangeText={(text) => updateCardDetails("number", text)}
                keyboardType="numeric"
                maxLength={19}
              />
              {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
            </View>

            <View style={styles.cardRow}>
              <View style={styles.cardHalf}>
                <Text style={styles.inputLabel}>Ngày hết hạn *</Text>
                <TextInput
                  style={[styles.textInput, errors.expiry && styles.textInputError]}
                  placeholder="MM/YY"
                  value={formData.cardDetails.expiry}
                  onChangeText={(text) => updateCardDetails("expiry", text)}
                  maxLength={5}
                />
                {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
              </View>
              <View style={styles.cardHalf}>
                <Text style={styles.inputLabel}>CVV *</Text>
                <TextInput
                  style={[styles.textInput, errors.cvv && styles.textInputError]}
                  placeholder="123"
                  value={formData.cardDetails.cvv}
                  onChangeText={(text) => updateCardDetails("cvv", text)}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                />
                {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên chủ thẻ *</Text>
              <TextInput
                style={[styles.textInput, errors.cardName && styles.textInputError]}
                placeholder="NGUYEN VAN A"
                value={formData.cardDetails.name}
                onChangeText={(text) => updateCardDetails("name", text.toUpperCase())}
                autoCapitalize="characters"
              />
              {errors.cardName && <Text style={styles.errorText}>{errors.cardName}</Text>}
            </View>
          </View>
        )}

        {/* Final Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(basePrice)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng cộng</Text>
            <Text style={styles.summaryValue}>{formatPrice(basePrice)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.primary }]}>
              Thanh toán ngay ({formData.paymentOption}%)
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              {formatPrice(getPaymentAmount())}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: "#6b7280" }]}>Số tiền còn lại</Text>
            <Text style={[styles.summaryValue, { color: "#6b7280" }]}>
              {formatPrice(basePrice - getPaymentAmount())}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onBack} style={styles.secondaryButton} disabled={isLoading}>
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePayment}
            disabled={isLoading}
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>{isLoading ? "Đang thanh toán..." : "Thanh toán"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.securityText}>Thanh toán an toàn & bảo mật</Text>
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  optionList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 6,
  },
  optionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionLabel: {
    fontSize: 16,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: "500",
  },
  methodIcon: {
    fontSize: 20,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontWeight: "500",
  },
  methodSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  radioButton: {
    padding: 4,
  },
  radioButtonInner: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#3b82f6",
  },
  radioButtonDot: {
    width: 8,
    height: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 4,
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
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  cardRow: {
    flexDirection: "row",
    gap: 16,
  },
  cardHalf: {
    flex: 1,
    gap: 8,
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    gap: 8,
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
  securityText: {
    fontSize: 12,
    textAlign: "center",
    color: "#6b7280",
  },
})
