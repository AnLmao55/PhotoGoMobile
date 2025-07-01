import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native"
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

const CheckBox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.checkbox}>
    <View style={[styles.checkboxInner, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkboxText}>✓</Text>}
    </View>
  </TouchableOpacity>
)

export default function Step1({ formData, onUpdateFormData, onNext, isLoading, selectedService }: StepProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ"
  }

  const basePrice = 6500000

  const handleServiceToggle = (service: keyof typeof formData.selectedServices) => {
    onUpdateFormData({
      selectedServices: {
        ...formData.selectedServices,
        [service]: !formData.selectedServices[service],
      },
    })
  }

  const handleVoucherChange = (voucher: string) => {
    onUpdateFormData({ voucher })
  }

  const calculateTotal = () => {
    let total = basePrice
    if (formData.selectedServices.premium) total += 1500000
    if (formData.selectedServices.album) total += 1200000
    if (formData.selectedServices.extraHour) total += 800000
    return total
  }

  const selectedConcept = selectedService?.serviceConcepts?.find(
    (c: any) => c.id === formData.selectedConceptId
  )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Concept Selector */}
        {selectedService?.serviceConcepts?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn concept</Text>

            <TouchableOpacity
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              style={styles.dropdownHeader}
            >
              <Text style={styles.dropdownText}>
                {selectedConcept?.name || "Chọn một concept"}
              </Text>
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownList}>
                {selectedService.serviceConcepts.map((concept: any) => (
                  <TouchableOpacity
                    key={concept.id}
                    onPress={() => {
                      setIsDropdownOpen(false)
                      onUpdateFormData({ selectedConceptId: concept.id })
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text>{concept.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        {selectedConcept && (
          <View style={styles.card}>
            <View style={styles.packageInfo}>
              <View style={styles.packageIcon}>
                <Text style={styles.packageIconText}>📸</Text>
              </View>
              <View style={styles.packageDetails}>
                <Text style={styles.packageTitle}>{selectedService.name}</Text>
                <Text style={styles.packageSubtitle}>{selectedConcept.name}</Text>
                <View style={styles.packageRating}>
                  <Text style={styles.star}>⭐</Text>
                  <Text style={styles.ratingText}>4 giờ</Text>
                </View>
                <View style={styles.packagePricing}>
                  <Text style={styles.packageLabel}>Chụp ảnh</Text>
                  <Text style={[styles.packagePrice, { color: theme.colors.primary }]}>{formatPrice(selectedConcept.price)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.packageMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📅</Text>
                <Text style={styles.metaText}>15/08/2025</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>🕘</Text>
                <Text style={styles.metaText}>09:00</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</Text>
              </View>
            </View>
          </View>
        )}
        {/* Additional Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ bổ sung</Text>
          <View style={styles.serviceList}>
            <View style={styles.serviceItem}>
              <CheckBox checked={formData.selectedServices.premium} onPress={() => handleServiceToggle("premium")} />
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceName}>Trang điểm cô dâu cao cấp</Text>
                <Text style={[styles.servicePrice, { color: theme.colors.primary }]}>
                  {formatPrice(1500000)}
                </Text>
              </View>
            </View>
            {/* Package Info */}

            <View style={styles.serviceItem}>
              <CheckBox checked={formData.selectedServices.album} onPress={() => handleServiceToggle("album")} />
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceName}>Album ảnh cao cấp thêm</Text>
                <Text style={[styles.servicePrice, { color: theme.colors.primary }]}>
                  {formatPrice(1200000)}
                </Text>
              </View>
            </View>

            <View style={styles.serviceItem}>
              <CheckBox checked={formData.selectedServices.extraHour} onPress={() => handleServiceToggle("extraHour")} />
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceName}>Chụp thêm 1 giờ</Text>
                <Text style={[styles.servicePrice, { color: theme.colors.primary }]}>
                  {formatPrice(800000)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Voucher Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voucher</Text>
          <View style={styles.voucherList}>
            {[
              { value: "", label: "Không sử dụng voucher" },
              { value: "discount10", label: "Giảm 10%" },
              { value: "discount15", label: "Giảm 15%" },
            ].map((voucher) => (
              <TouchableOpacity
                key={voucher.value}
                onPress={() => handleVoucherChange(voucher.value)}
                style={[
                  styles.voucherItem,
                  {
                    borderColor: formData.voucher === voucher.value ? theme.colors.primary : "#e5e7eb",
                    backgroundColor: formData.voucher === voucher.value ? "#fef3e2" : "white",
                  },
                ]}
              >
                <Text style={styles.voucherText}>{voucher.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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

        <TouchableOpacity
          onPress={onNext}
          disabled={isLoading}
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }, isLoading && styles.buttonDisabled]}
        >
          <Text style={styles.primaryButtonText}>{isLoading ? "Đang xử lý..." : "Tiếp tục →"}</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
  },
  packageInfo: {
    flexDirection: "row",
    gap: 12,
  },
  packageIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#fed7aa",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  packageIconText: {
    fontSize: 24,
  },
  packageDetails: {
    flex: 1,
  },
  packageTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  packageSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  packageRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  star: {
    color: "#fbbf24",
  },
  ratingText: {
    fontSize: 14,
  },
  packagePricing: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  packageLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  packagePrice: {
    fontWeight: "600",
    fontSize: 18,
  },
  packageMeta: {
    marginTop: 16,
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 14,
    color: "#6b7280",
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 8,
  },
  dropdownHeader: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 14,
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  serviceList: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontWeight: "500",
  },
  servicePrice: {
    fontSize: 14,
  },
  checkbox: {
    padding: 4,
  },
  checkboxInner: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  checkboxText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  voucherList: {
    gap: 8,
  },
  voucherItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
  },
  voucherText: {
    fontSize: 14,
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
  summaryTotalLabel: {
    fontWeight: "600",
    fontSize: 18,
  },
  summaryTotalValue: {
    fontWeight: "600",
    fontSize: 18,
  },
  primaryButton: {
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
