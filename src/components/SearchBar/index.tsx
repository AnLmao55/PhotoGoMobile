import { useState } from "react"
import { TextInput, StyleSheet, View, Image, Text } from "react-native"
import LocationButton from "./LocationButton"
import { theme } from "../../theme/theme"

const logo = require("../../../assets/logoden.png")

interface LocationData {
  lat: number
  lng: number
  address?: string
}

const SearchBarWithLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)

  const handleLocationChange = (location: LocationData | null) => {
    setCurrentLocation(location)
  }

  const getDisplayAddress = () => {
    if (!currentLocation) return "Hãy chọn vị trí của bạn"

    if (currentLocation.address) {
      // Shorten the address for display
      const parts = currentLocation.address.split(",")
      return parts.slice(0, 3).join(",")
    }

    return `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.locationContainer}>
          <Text style={styles.location} numberOfLines={1}>
            {getDisplayAddress()}
          </Text>
          <LocationButton onLocationChange={handleLocationChange} iconSize={20} iconColor="#50C878" />
        </View>
      </View>
      <TextInput
        style={styles.search}
        placeholder="🔍 Bạn đang tìm gì?"
        placeholderTextColor={theme.colors.lightText}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.md * 2,
    width: "100%",
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: theme.spacing.sm,
  },
  locationContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  location: {
    flex: 1,
    textAlign: "right",
    color: theme.colors.text,
    fontSize: 14,
    marginRight: 8,
  },
  search: {
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.lightText,
    borderRadius: 40,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: "#E6F0FA",
    width: "100%",
    marginTop: 10,
  },
})

export default SearchBarWithLocation
