"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { theme } from "../../theme/theme"

interface LocationData {
  lat: number
  lng: number
  address?: string
}

interface LocationButtonProps {
  onLocationChange?: (location: LocationData | null) => void
  iconSize?: number
  iconColor?: string
}

const LocationButton: React.FC<LocationButtonProps> = ({ onLocationChange, iconSize = 24, iconColor =theme.colors.primary }) => {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [manualAddress, setManualAddress] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Load location from AsyncStorage on component mount
  useEffect(() => {
    loadLocationFromStorage()
  }, [])

  // Save location to AsyncStorage whenever it changes
  useEffect(() => {
    if (location) {
      saveLocationToStorage(location)
      onLocationChange?.(location)
    }
  }, [location, onLocationChange])

  const loadLocationFromStorage = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem("user_location")
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation))
      }
    } catch (error) {
      console.log("Error loading location from storage:", error)
    }
  }

  const saveLocationToStorage = async (locationData: LocationData) => {
    try {
      await AsyncStorage.setItem("user_location", JSON.stringify(locationData))
    } catch (error) {
      console.log("Error saving location to storage:", error)
    }
  }

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: "Quyền truy cập vị trí",
          message: "Ứng dụng cần quyền truy cập vị trí để hiển thị vị trí hiện tại của bạn.",
          buttonNeutral: "Hỏi lại sau",
          buttonNegative: "Hủy",
          buttonPositive: "Đồng ý",
        })
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn(err)
        return false
      }
    }
    return true
  }

  const getCurrentLocation = async () => {
    setLoading(true)
    setError(null)

    const hasPermission = await requestLocationPermission()
    if (!hasPermission) {
      setError("Quyền truy cập vị trí bị từ chối")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log("Current location:", latitude, longitude) // <-- Thêm dòng này
        const locationData = { lat: latitude, lng: longitude }
        setLocation(locationData)
        fetchAddress(latitude, longitude)
        setLoading(false)
      },
      (error) => {
        setError("Không thể lấy vị trí hiện tại")
        console.log("Location error:", error)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    )
  }

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await response.json()

      if (data && data.display_name) {
        setLocation((prev) => (prev ? { ...prev, address: data.display_name } : null))
      }
    } catch (error) {
      console.log("Error fetching address:", error)
    }
  }

  const handleManualLocationSubmit = async () => {
    if (!manualAddress.trim()) {
      setError("Vui lòng nhập địa chỉ")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const lat = Number.parseFloat(data[0].lat)
        const lng = Number.parseFloat(data[0].lon)
        console.log("Manual location:", lat, lng) // <-- Thêm dòng này
        setLocation({
          lat,
          lng,
          address: data[0].display_name,
        })
        setModalVisible(false)
        setManualAddress("")
      } else {
        setError("Không tìm thấy địa chỉ này")
      }
    } catch (error) {
      setError("Có lỗi khi tìm địa chỉ")
    } finally {
      setLoading(false)
    }
  }

  const showLocationInfo = () => {
    if (location) {
      const message = location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      Alert.alert("Vị trí hiện tại", message, [
        { text: "Đóng", style: "cancel" },
        { text: "Chọn lại", onPress: () => setModalVisible(true) },
      ])
    } else {
      Alert.alert("Chưa có vị trí", "Bạn muốn lấy vị trí hiện tại hay nhập thủ công?", [
        { text: "Hủy", style: "cancel" },
        { text: "Lấy vị trí", onPress: getCurrentLocation },
        { text: "Nhập thủ công", onPress: () => setModalVisible(true) },
      ])
    }
  }

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={showLocationInfo} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <Ionicons name="location" size={iconSize} color={location ? iconColor : "#999"} />
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn vị trí thủ công</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false)
                  setManualAddress("")
                  setError(null)
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Địa chỉ</Text>
              <TextInput
                style={styles.textInput}
                value={manualAddress}
                onChangeText={setManualAddress}
                placeholder="Ví dụ: 123 Lê Lợi, Quận 1, TP.HCM"
                multiline
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false)
                  setManualAddress("")
                  setError(null)
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleManualLocationSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "500",
  },
})

export default LocationButton
