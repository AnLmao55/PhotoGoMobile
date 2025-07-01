"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native"
import type { StepProps, LocationAvailability, SlotTimeWorkingDate } from "../../../types/payment"
import { paymentApi } from "../../../services/paymentApi"

const theme = {
  colors: {
    primary: "#f6ac69",
    secondary: "#E9D8FD",
    background: "#fdfcff",
    text: "#2D3748",
    lightText: "#A0AEC0",
  },
}

export default function Step2({
  formData,
  onUpdateFormData,
  onNext,
  onBack,
  isLoading,
  vendorData,
}: StepProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [locationAvailability, setLocationAvailability] = useState<LocationAvailability | null>(null)
  const [dateSlots, setDateSlots] = useState<SlotTimeWorkingDate[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedSlotId, setSelectedSlotId] = useState<string>("")
  const [loadingDates, setLoadingDates] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Get first location ID from vendor data
  const getLocationId = () => {
    return vendorData?.locations?.[0]?.id || ""
  }

  useEffect(() => {
    const fetchLocationAvailability = async () => {
      const locationId = getLocationId()
      if (!locationId) return

      try {
        setLoadingDates(true)
        const response = await paymentApi.fetchLocationAvailability(locationId)
        if (response.data.data.length > 0) {
          setLocationAvailability(response.data.data[0])
        }
      } catch (error) {
        console.error("Error fetching location availability:", error)
        Alert.alert("Lỗi", "Không thể tải thông tin lịch trống")
      } finally {
        setLoadingDates(false)
      }
    }

    fetchLocationAvailability()
  }, [vendorData])

  useEffect(() => {
    const fetchDateSlots = async () => {
      if (!selectedDate) {
        setDateSlots([])
        return
      }

      const locationId = getLocationId()
      if (!locationId) return

      try {
        setLoadingSlots(true)
        const response = await paymentApi.fetchDateAvailability(locationId, selectedDate)
        if (response.data.data.length > 0) {
          setDateSlots(response.data.data[0].slotTimeWorkingDates)
        }
      } catch (error) {
        console.error("Error fetching date slots:", error)
        Alert.alert("Lỗi", "Không thể tải thông tin khung giờ")
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchDateSlots()
  }, [selectedDate])

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

  const getMonthName = (month: number) => {
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ]
    return months[month - 1]
  }

  // Convert DD/MM/YYYY to YYYY-MM-DD
  const convertApiDateToInternal = (apiDate: string): string => {
    const [day, month, year] = apiDate.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  // Convert YYYY-MM-DD to DD/MM/YYYY
  const convertInternalDateToDisplay = (internalDate: string): string => {
    const [year, month, day] = internalDate.split("-")
    return `${day}/${month}/${year}`
  }

  // Convert HH:MM:SS to HH:MM
  const formatTimeSlot = (timeString: string): string => {
    return timeString.substring(0, 5)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 1) {
        setCurrentMonth(12)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
    setSelectedDate("")
    setSelectedTime("")
    setSelectedSlotId("")
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime("")
    setSelectedSlotId("")
  }

  const handleTimeSelect = (slot: SlotTimeWorkingDate) => {
    const timeString = formatTimeSlot(slot.startSlotTime)
    setSelectedTime(timeString)
    setSelectedSlotId(slot.id)
    onUpdateFormData({
      bookingDateTime: {
        date: selectedDate,
        time: timeString,
        slotId: slot.id,
      },
    })
  }

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày và giờ")
      return
    }
    onNext()
  }

  const isDateAvailable = (date: string) => {
    if (!locationAvailability) return false
    return locationAvailability.workingDates.some(
      (workingDate) => convertApiDateToInternal(workingDate.date) === date && workingDate.isAvailable,
    )
  }

  const isToday = (date: string) => {
    const today = new Date().toISOString().split("T")[0]
    return date === today
  }

  const isPastDate = (date: string) => {
    const today = new Date().toISOString().split("T")[0]
    return date < today
  }

  const renderCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    // Adjust first day to align with Sunday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
      const isPast = isPastDate(date)
      const isTodayDate = isToday(date)
      const isSelected = selectedDate === date
      const isAvailable = isDateAvailable(date)

      const dayStyle = [styles.dayCell]
      const textStyle = [styles.dayText]
      let icon = null

      if (isPast) {
        dayStyle.push(styles.pastDay)
        textStyle.push(styles.pastDayText)
      } else if (isSelected) {
        dayStyle.push(styles.selectedDay)
        textStyle.push(styles.selectedDayText)
        icon = <Text style={styles.dayIcon}>✓</Text>
      } else if (isTodayDate) {
        dayStyle.push(styles.todayDay)
        textStyle.push(styles.todayDayText)
        icon = <Text style={styles.dayIcon}>●</Text>
      } else if (isAvailable) {
        dayStyle.push(styles.availableDay)
        icon = <Text style={styles.dayIcon}>✓</Text>
      } else {
        dayStyle.push(styles.unavailableDay)
        textStyle.push(styles.unavailableDayText)
        icon = <Text style={styles.dayIcon}>✕</Text>
      }

      days.push(
        <TouchableOpacity
          key={date}
          style={dayStyle}
          onPress={() => !isPast && isAvailable && handleDateSelect(date)}
          disabled={isPast || !isAvailable}
        >
          <Text style={textStyle}>{day}</Text>
          {icon}
        </TouchableOpacity>,
      )
    }

    // Add empty cells to fill the last row if needed
    const totalCells = days.length
    const remainingCells = (7 - (totalCells % 7)) % 7
    for (let i = 0; i < remainingCells; i++) {
      days.push(<View key={`empty-end-${i}`} style={styles.emptyDay} />)
    }

    return days
  }

  const renderTimeSlots = () => {
    if (loadingSlots) {
      return (
        <View style={styles.loadingSlots}>
          <Text style={styles.loadingSlotsText}>Đang tải khung giờ...</Text>
        </View>
      )
    }

    if (dateSlots.length === 0) {
      return (
        <View style={styles.noSlotsAvailable}>
          <Text style={styles.noSlotsText}>Không có khung giờ nào khả dụng</Text>
        </View>
      )
    }

    return dateSlots.map((slot) => {
      const isSelected = selectedSlotId === slot.id
      const timeString = formatTimeSlot(slot.startSlotTime)
      const buttonStyle = [styles.timeSlot]
      const textStyle = [styles.timeSlotText]
      let statusText = null

      if (!slot.isAvailable) {
        buttonStyle.push(styles.timeSlotBooked)
        textStyle.push(styles.timeSlotBookedText)
        statusText = <Text style={styles.timeSlotStatus}>Đã đặt</Text>
      } else if (isSelected) {
        buttonStyle.push(styles.timeSlotSelected)
        textStyle.push(styles.timeSlotSelectedText)
      } else {
        buttonStyle.push(styles.timeSlotAvailable)
      }

      return (
        <TouchableOpacity
          key={slot.id}
          style={buttonStyle}
          onPress={() => slot.isAvailable && handleTimeSelect(slot)}
          disabled={!slot.isAvailable}
        >
          <Text style={styles.timeSlotIcon}>🕐</Text>
          <Text style={textStyle}>{timeString}</Text>
          {statusText}
          {slot.isAvailable && (
            <Text style={styles.availableSlots}>{slot.maxParallelBookings - slot.alreadyBooked} slot</Text>
          )}
        </TouchableOpacity>
      )
    })
  }

  if (loadingDates) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải lịch trống...</Text>
      </View>
    )
  }

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
          </View>
        )}

        {/* Location Info */}
        {locationAvailability && (
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>📍 Địa điểm chụp</Text>
            <Text style={styles.locationAddress}>
              {locationAvailability.location.address}, {locationAvailability.location.district},{" "}
              {locationAvailability.location.city}
            </Text>
            <Text style={styles.locationHours}>
              Giờ hoạt động: {formatTimeSlot(locationAvailability.startTime)} -{" "}
              {formatTimeSlot(locationAvailability.endTime)}
            </Text>
          </View>
        )}

        <View style={styles.dateTimeContainer}>
          {/* Date Selection */}
          <View style={styles.dateSection}>
            <Text style={styles.sectionTitle}>Chọn ngày</Text>

            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={() => navigateMonth("prev")} style={styles.navButton}>
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {getMonthName(currentMonth)} {currentYear}
              </Text>
              <TouchableOpacity onPress={() => navigateMonth("next")} style={styles.navButton}>
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeaders}>
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                <Text key={day} style={styles.dayHeader}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>{renderCalendar()}</View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <Text style={styles.legendIcon}>✓</Text>
                <Text style={styles.legendText}>Còn slot</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.legendIcon}>✕</Text>
                <Text style={styles.legendText}>Hết slot</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.legendIcon}>●</Text>
                <Text style={styles.legendText}>Hôm nay</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.selectedLegendIcon} />
                <Text style={styles.legendText}>Đã chọn</Text>
              </View>
            </View>
          </View>

          {/* Time Selection */}
          <View style={styles.timeSection}>
            <Text style={styles.sectionTitle}>
              Chọn khung giờ {selectedDate && `- ${convertInternalDateToDisplay(selectedDate)}`}
            </Text>

            {selectedDate ? (
              <ScrollView
                style={styles.timeSlotContainer}
                showsVerticalScrollIndicator={false} // Enable scroll indicator for debugging
                nestedScrollEnabled={true} // Enable nested scrolling
              >
                {renderTimeSlots()}
              </ScrollView>
            ) : (
              <View style={styles.noDateSelected}>
                <Text style={styles.noDateSelectedText}>Vui lòng chọn ngày trước</Text>
              </View>
            )}
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

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onBack} style={styles.secondaryButton} disabled={isLoading}>
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            disabled={isLoading || !selectedDate || !selectedTime}
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
              (isLoading || !selectedDate || !selectedTime) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading
                ? "Đang xử lý..."
                : !selectedDate || !selectedTime
                  ? "Vui lòng chọn ngày và giờ"
                  : "Tiếp tục →"}
            </Text>
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
  },
  locationCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  locationHours: {
    fontSize: 12,
    color: "#6b7280",
  },
  dateTimeContainer: {
    gap: 24,
  },
  dateSection: {
    gap: 16,
  },
  timeSection: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 18,
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  dayHeaders: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "center",
    width: 40,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    columnGap: 10,
    marginLeft: 7,
  },
  emptyDay: {
    width: 40,
    height: 40,
    margin: 2,
  },
  dayCell: {
    width: 40,
    height: 40,
    margin: 2,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",

  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dayIcon: {
    position: "absolute",
    bottom: 2,
    right: 2,
    fontSize: 8,
  },
  pastDay: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  pastDayText: {
    color: "#9ca3af",
  },
  availableDay: {
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  unavailableDay: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  unavailableDayText: {
    color: "#ef4444",
  },
  todayDay: {
    backgroundColor: "#fff7ed",
    borderColor: "#f97316",
  },
  todayDayText: {
    color: "#f97316",
    fontWeight: "600",
  },
  selectedDay: {
    backgroundColor: "#f6ac69",
    borderColor: "#f6ac69",
  },
  selectedDayText: {
    color: "white",
    fontWeight: "600",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendIcon: {
    fontSize: 12,
    width: 16,
    textAlign: "center",
  },
  selectedLegendIcon: {
    width: 12,
    height: 12,
    backgroundColor: "#f6ac69",
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
  timeSlotContainer: {
    flexGrow: 1,
    maxHeight: 300,
  },
  loadingSlots: {
    padding: 20,
    alignItems: "center",
  },
  loadingSlotsText: {
    fontSize: 14,
    color: "#6b7280",
  },
  noSlotsAvailable: {
    padding: 20,
    alignItems: "center",
  },
  noSlotsText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
  },
  timeSlotIcon: {
    fontSize: 16,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  timeSlotStatus: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    color: "#ef4444",
  },
  availableSlots: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "500",
  },
  timeSlotAvailable: {
    backgroundColor: "white",
    borderColor: "#d1d5db",
  },
  timeSlotSelected: {
    backgroundColor: "#fef3e2",
    borderColor: "#f6ac69",
  },
  timeSlotSelectedText: {
    color: "#f6ac69",
  },
  timeSlotBooked: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  timeSlotBookedText: {
    color: "#ef4444",
  },
  timeSlotUnavailable: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  timeSlotUnavailableText: {
    color: "#9ca3af",
  },
  noDateSelected: {
    padding: 40,
    alignItems: "center",
  },
  noDateSelectedText: {
    fontSize: 16,
    color: "#6b7280",
    fontStyle: "italic",
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