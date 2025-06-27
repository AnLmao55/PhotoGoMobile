import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native"
import { theme } from "../../theme/theme"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import axios from "axios"
interface Location {
  id: string
  address: string
  district: string
  ward: string
  city: string
  province: string
  latitude: string
  longitude: string
}

interface Category {
  id: string
  name: string
}

interface StudioItem {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  banner: string
  status: string
  category: Category
  locations: Location[]
  averageRating: number
  reviewCount: number
  minPrice: number
  maxPrice: number
}

interface ApiResponse {
  statusCode: number
  message: string
  data: {
    data: StudioItem[]
    pagination: {
      current: number
      pageSize: number
      totalPage: number
      totalItem: number
    }
  }
}

const Studio: React.FC = () => {
  const navigation = useNavigation()
  const [studios, setStudios] = useState<StudioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudios()
  }, [])

  const fetchStudios = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/vendors/filter`, {
        params: {
          current: 1,
          pageSize: 10,
          sortBy: 'distance',
          sortDirection: 'desc',
          userLatitude: 10.762622,
          userLongitude: 106.660172,
          maxDistance: 5
        }
      }
      )
      setStudios(response.data.data.data)
    } catch (error) {
      console.error("Error fetching studios:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderItem = ({ item }: { item: StudioItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate("Detail", { slug: item.slug })
        // alert(`${item.slug}`)
      }}
    >
      <Image source={{ uri: item.logo || item.banner }} style={styles.image} />
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>

      <Text style={styles.address} numberOfLines={2}>
        {item.locations[0]?.address || "Địa chỉ không có sẵn"}
      </Text>

      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.rating}>{item.averageRating?.toFixed(1) ?? "N/A"}</Text>
        <Text style={styles.ratingCount}>({item.reviewCount ?? 0} đánh giá)</Text>
      </View>

      <Text style={styles.price}>
        {item.minPrice && item.maxPrice
          ? `${item.minPrice.toLocaleString()}₫ - ${item.maxPrice.toLocaleString()}₫`
          : "Giá: Liên hệ"}
      </Text>

      <TouchableOpacity
        style={styles.favoriteIcon}
        onPress={() => {
          console.log("Favorited:", item.name)
          // Handle favorite functionality
        }}
      >
        <Ionicons name="heart-outline" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>STUDIO GẦN BẠN</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Đang tải...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>STUDIO GẦN BẠN</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AllStudio")}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={studios}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  viewAll: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    elevation: 3,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
    backgroundColor: "#f0f0f0",
  },
  name: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  address: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.lightText,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
    fontWeight: "500",
  },
  ratingCount: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.lightText,
    marginLeft: theme.spacing.xs,
  },
  favoriteIcon: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  price: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: theme.spacing.xs,
  },
})

export default Studio
