import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  ScrollView,
} from "react-native"
import { theme } from "../theme/theme"
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

const AllStudio: React.FC = () => {
  const navigation = useNavigation()
  const [studios, setStudios] = useState<StudioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterVisible, setFilterVisible] = useState(false)
  const [filters, setFilters] = useState({
    name: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    maxRating: "",
    category: "",
  })

  useEffect(() => {
    fetchStudios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchStudios = async (customFilters = filters) => {
    try {
      setLoading(true)
      const params: any = {
        current: 1,
        pageSize: 20,
        sortBy: "distance",
        sortDirection: "desc",
        ...customFilters,
      }
      // Xóa param rỗng
      Object.keys(params).forEach((key) => {
        if (params[key] === "") delete params[key]
      })
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/vendors/filter`,
        { params }
      )
      setStudios(response.data.data.data)
    } catch (error) {
      console.error("Error fetching studios:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilter = () => {
    setFilterVisible(false)
    fetchStudios()
  }

  const renderItem = ({ item }: { item: StudioItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate("Detail", { slug: item.slug })
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
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.sectionTitle}>Thông tin về các Studio</Text> */}
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Ionicons name="filter" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      {/* Drawer Filter */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              minHeight: 400,
              maxHeight: "80%",
            }}
          >
            <ScrollView>
              <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
                Bộ lọc
              </Text>
              <Text>Tên Studio</Text>
              <TextInput
                value={filters.name}
                onChangeText={(text) => setFilters((f) => ({ ...f, name: text }))}
                placeholder="Nhập tên studio"
                style={styles.input}
              />
              <Text>Vị trí</Text>
              <TextInput
                value={filters.location}
                onChangeText={(text) =>
                  setFilters((f) => ({ ...f, location: text }))
                }
                placeholder="Nhập vị trí"
                style={styles.input}
              />
              <Text>Giá tối thiểu</Text>
              <TextInput
                value={filters.minPrice}
                onChangeText={(text) =>
                  setFilters((f) => ({ ...f, minPrice: text }))
                }
                placeholder="Giá từ"
                keyboardType="numeric"
                style={styles.input}
              />
              <Text>Giá tối đa</Text>
              <TextInput
                value={filters.maxPrice}
                onChangeText={(text) =>
                  setFilters((f) => ({ ...f, maxPrice: text }))
                }
                placeholder="Giá đến"
                keyboardType="numeric"
                style={styles.input}
              />
              <Text>Điểm đánh giá tối thiểu (1-5)</Text>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFilters((f) => ({ ...f, minRating: String(star) }))}
                  >
                    <Ionicons
                      name={
                        Number(filters.minRating) >= star
                          ? "star"
                          : "star-outline"
                      }
                      size={28}
                      color="#FFD700"
                      style={{ marginRight: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text>Điểm đánh giá tối đa (1-5)</Text>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFilters((f) => ({ ...f, maxRating: String(star) }))}
                  >
                    <Ionicons
                      name={
                        Number(filters.maxRating) >= star
                          ? "star"
                          : "star-outline"
                      }
                      size={28}
                      color="#FFD700"
                      style={{ marginRight: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text>Loại dịch vụ</Text>
              <TextInput
                value={filters.category}
                onChangeText={(text) =>
                  setFilters((f) => ({ ...f, category: text }))
                }
                placeholder="Nhập loại dịch vụ"
                style={styles.input}
              />
              <View style={{ marginTop: 10 }}>
                <Button title="Áp dụng" color={theme.colors.primary} onPress={handleApplyFilter} />
                <View style={{ height: 8 }} />
                <Button
                  title="Đóng"
                  color="gray"
                  onPress={() => setFilterVisible(false)}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={studios}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    flex: 1,
  },
  header: {

    alignItems: "flex-end",
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    color: theme.colors.text,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    padding: 8,
  },
  price: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: theme.spacing.xs,
  },
})

export default AllStudio