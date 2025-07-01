import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native"
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

const RadioButton = ({ selected, onPress }: { selected: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.radioButton}>
    <View style={[styles.radioButtonInner, selected && styles.radioButtonSelected]}>
      {selected && <View style={styles.radioButtonDot} />}
    </View>
  </TouchableOpacity>
)

export default function Step1({ formData, onUpdateFormData, onNext, isLoading, vendorData }: StepProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ"
  }

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

  const handleConceptSelect = (concept: any) => {
    onUpdateFormData({ selectedConcept: concept })
  }

  const calculateTotal = () => {
    let total = formData.selectedConcept ? Number.parseFloat(formData.selectedConcept.price) : 0
    if (formData.selectedServices.premium) total += 1500000
    if (formData.selectedServices.album) total += 1200000
    if (formData.selectedServices.extraHour) total += 800000
    return total
  }

  // Get all concepts from all service packages
  const getAllConcepts = () => {
    if (!vendorData) return []
    const concepts: any[] = []
    vendorData.servicePackages.forEach((pkg) => {
      pkg.serviceConcepts.forEach((concept) => {
        concepts.push({
          ...concept,
          packageName: pkg.name,
          packageId: pkg.id,
        })
      })
    })
    return concepts
  }

  const allConcepts = getAllConcepts()

  if (!vendorData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Vendor Info */}
        <View style={styles.card}>
          <View style={styles.vendorInfo}>
            <Image source={{ uri: vendorData.logo }} style={styles.vendorLogo} />
            <View style={styles.vendorDetails}>
              <Text style={styles.vendorName}>{vendorData.name}</Text>
              <Text style={styles.vendorCategory}>{vendorData.category.name}</Text>
              <View style={styles.vendorRating}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.ratingText}>{vendorData.averageRating.toFixed(1)}</Text>
              </View>
              {vendorData.locations.length > 0 && (
                <View style={styles.locationInfo}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>
                    {vendorData.locations[0].address}, {vendorData.locations[0].district}, {vendorData.locations[0].city}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Concept Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn gói chụp ảnh</Text>
          {allConcepts.length === 0 ? (
            <Text style={styles.noConceptText}>Không có gói chụp ảnh nào khả dụng</Text>
          ) : (
            <View style={styles.conceptList}>
              {allConcepts.map((concept) => (
                <TouchableOpacity
                  key={concept.id}
                  onPress={() => handleConceptSelect(concept)}
                  style={[
                    styles.conceptItem,
                    {
                      borderColor: formData.selectedConcept?.id === concept.id ? theme.colors.primary : "#e5e7eb",
                      borderWidth: formData.selectedConcept?.id === concept.id ? 2 : 1,
                      backgroundColor: formData.selectedConcept?.id === concept.id ? "#fef3e2" : "white",
                    },
                  ]}
                >
                  <View style={styles.conceptHeader}>
                    <RadioButton
                      selected={formData.selectedConcept?.id === concept.id}
                      onPress={() => handleConceptSelect(concept)}
                    />
                    <View style={styles.conceptInfo}>
                      <Text style={styles.conceptName}>{concept.name}</Text>
                      <Text style={styles.conceptPackage}>Gói: {concept.packageName}</Text>
                      <Text style={[styles.conceptPrice, { color: theme.colors.primary }]}>
                        {formatPrice(Number.parseFloat(concept.price))}
                      </Text>
                    </View>
                  </View>

                  {/* {concept.images && concept.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.conceptImages}>
                      {concept.images.slice(0, 3).map((image: string, index: number) => (
                        <Image key={index} source={{ uri: image }} style={styles.conceptImage} />
                      ))}
                      {concept.images.length > 3 && (
                        <View style={styles.moreImagesIndicator}>
                          <Text style={styles.moreImagesText}>+{concept.images.length - 3}</Text>
                        </View>
                      )}
                    </ScrollView>
                  )} */}

                  {/* <Text style={styles.conceptDescription} numberOfLines={3}>
                    {concept.description}
                  </Text> */}

                  {/* {concept.serviceTypes && concept.serviceTypes.length > 0 && (
                    <View style={styles.serviceTypes}>
                      {concept.serviceTypes.map((type: any) => (
                        <View key={type.id} style={styles.serviceTypeTag}>
                          <Text style={styles.serviceTypeText}>{type.name}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {concept.duration > 0 && (
                    <View style={styles.durationInfo}>
                      <Text style={styles.durationIcon}>⏱️</Text>
                      <Text style={styles.durationText}>{Math.round(concept.duration / 60)} giờ</Text>
                    </View>
                  )} */}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Additional Services - Only show if concept is selected */}
        {formData.selectedConcept && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dịch vụ bổ sung</Text>
            <View style={styles.serviceList}>
              <View style={styles.serviceItem}>
                <CheckBox
                  checked={formData.selectedServices.premium}
                  onPress={() => handleServiceToggle("premium")}
                />
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceName}>Trang điểm cô dâu cao cấp</Text>
                  <Text style={[styles.servicePrice, { color: theme.colors.primary }]}>{formatPrice(1500000)}</Text>
                </View>
              </View>

              <View style={styles.serviceItem}>
                <CheckBox checked={formData.selectedServices.album} onPress={() => handleServiceToggle("album")} />
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceName}>Album ảnh cao cấp thêm</Text>
                  <Text style={[styles.servicePrice, { color: theme.colors.primary }]}>{formatPrice(1200000)}</Text>
                </View>
              </View>

              <View style={styles.serviceItem}>
                <CheckBox
                  checked={formData.selectedServices.extraHour}
                  onPress={() => handleServiceToggle("extraHour")}
                />
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceName}>Chụp thêm 1 giờ</Text>
                  <Text style={[styles.servicePrice, { color: theme.colors.primary }]}>{formatPrice(800000)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Voucher Selection - Only show if concept is selected */}
        {formData.selectedConcept && (
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
        )}

        {/* Order Summary - Only show if concept is selected */}
        {formData.selectedConcept && (
          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gói chụp ảnh</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(Number.parseFloat(formData.selectedConcept.price))}
              </Text>
            </View>
            {formData.selectedServices.premium && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Trang điểm cao cấp</Text>
                <Text style={styles.summaryValue}>{formatPrice(1500000)}</Text>
              </View>
            )}
            {formData.selectedServices.album && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Album cao cấp</Text>
                <Text style={styles.summaryValue}>{formatPrice(1200000)}</Text>
              </View>
            )}
            {formData.selectedServices.extraHour && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Chụp thêm 1 giờ</Text>
                <Text style={styles.summaryValue}>{formatPrice(800000)}</Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Tổng cộng</Text>
              <Text style={styles.summaryTotalValue}>{formatPrice(calculateTotal())}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={onNext}
          disabled={isLoading || !formData.selectedConcept}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
            (isLoading || !formData.selectedConcept) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? "Đang xử lý..." : !formData.selectedConcept ? "Vui lòng chọn gói chụp ảnh" : "Tiếp tục →"}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
  },
  vendorInfo: {
    flexDirection: "row",
    gap: 12,
  },
  vendorLogo: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  vendorDetails: {
    flex: 1,
  },
  vendorName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  vendorCategory: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  vendorRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  star: {
    color: "#fbbf24",
  },
  ratingText: {
    fontSize: 14,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
    marginTop: 1,
  },
  locationText: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
  },
  section: {
    gap: 5,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  noConceptText: {
    textAlign: "center",
    color: "#6b7280",
    fontStyle: "italic",
    padding: 10,
  },
  conceptList: {
    gap: 6,
  },
  conceptItem: {
    padding: 5,
    borderRadius: 8,
    gap: 5,
  },
  conceptHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  conceptInfo: {
    flex: 1,
  },
  conceptName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  conceptPackage: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  conceptPrice: {
    fontWeight: "600",
    fontSize: 18,
  },
  conceptImages: {
    marginVertical: 8,
  },
  conceptImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 8,
  },
  moreImagesIndicator: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  moreImagesText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  conceptDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  serviceTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  serviceTypeTag: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceTypeText: {
    fontSize: 12,
    color: "#374151",
  },
  durationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  durationIcon: {
    fontSize: 12,
  },
  durationText: {
    fontSize: 12,
    color: "#6b7280",
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
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontWeight: "600",
    fontSize: 16,
  },
  summaryTotalValue: {
    fontWeight: "600",
    fontSize: 16,
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
