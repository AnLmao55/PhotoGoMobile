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
  ActivityIndicator,
} from "react-native"
import { theme } from "../theme/theme"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import axios from "axios"

const SERVICE_TYPE_API = `${process.env.EXPO_PUBLIC_API_URL}service-packages/service-type`;

const sortOptions = [
  { label: 'Giá', value: 'price' },
  { label: 'Tên', value: 'name' },
];
const sortDirOptions = [
  { label: 'Tăng dần', value: 'asc' },
  { label: 'Giảm dần', value: 'desc' },
];

const LOCATION_ENUM = [
  'TP.HCM',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'Nha Trang',
  'Huế',
];

const AllStudio = () => {
  const navigation = useNavigation<any>()
  const [studios, setStudios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterVisible, setFilterVisible] = useState(false)
  const [serviceTypes, setServiceTypes] = useState<any[]>([])
  const [filters, setFilters] = useState({
    name: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    maxRating: "",
    location: "",
    sortBy: 'price',
    sortDirection: 'asc',
    current: 1,
    pageSize: 20,
  })
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchStudios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.current, filters.pageSize, filters.name, filters.minPrice, filters.maxPrice, filters.minRating, filters.maxRating, filters.location, filters.sortBy, filters.sortDirection])

  useEffect(() => {
    if (filterVisible && serviceTypes.length === 0) {
      fetchServiceTypes();
    }
  }, [filterVisible]);

  const fetchServiceTypes = async () => {
    try {
      const res = await fetch(SERVICE_TYPE_API);
      const json = await res.json();
      setServiceTypes(json?.data?.data || []);
    } catch (e) {
      setServiceTypes([]);
    }
  };

  const fetchStudios = async () => {
    try {
      setLoading(true)
      const params: any = {
        ...filters,
      }
      // Xóa param rỗng
      Object.keys(params).forEach((key) => {
        if (Array.isArray(params[key]) && params[key].length === 0) delete params[key]
        if (params[key] === "") delete params[key]
      })
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/vendors/filter`,
        { params }
      )
      setStudios(response.data.data.data)
    } catch (error) {
      setStudios([])
    } finally {
      setLoading(false)
    }
  }

  // Search handler
  const handleSearch = () => {
    setFilters((f) => ({ ...f, name: search, current: 1 }))
  }

  // Sort handler
  const handleSort = (sortBy: string) => {
    setFilters((f) => ({ ...f, sortBy, current: 1 }))
  }
  const handleSortDir = (sortDirection: string) => {
    setFilters((f) => ({ ...f, sortDirection, current: 1 }))
  }

  // Filter handler
  const handleFilter = (newParams: any) => {
    setFilters((f) => ({
      ...f,
      minPrice: newParams.minPrice,
      maxPrice: newParams.maxPrice,
      minRating: newParams.minRating,
      maxRating: newParams.maxRating,
      location: newParams.location,
      current: 1,
    }))
    setFilterVisible(false)
  }

  const renderItem = ({ item }: { item: any }) => (
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
      {/* Search box */}
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm studio..."
          style={styles.searchInput}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Sort row - all sort options on one line */}
      <View style={styles.sortRow}>
        <Text style={{ marginRight: 8 }}>Sắp xếp:</Text>
        <View style={styles.sortOptionsContainer}>
          {sortOptions.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortBtn, filters.sortBy === opt.value && styles.sortBtnActive]}
              onPress={() => handleSort(opt.value)}
            >
              <Text style={{ color: filters.sortBy === opt.value ? '#fff' : theme.colors.text }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          {sortDirOptions.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortBtn, filters.sortDirection === opt.value && styles.sortBtnActive]}
              onPress={() => handleSortDir(opt.value)}
            >
              <Text style={{ color: filters.sortDirection === opt.value ? '#fff' : theme.colors.text }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Filter button moved to separate row */}
      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.filterButton}>
          <Ionicons name="filter" size={22} color="#fff" />
          <Text style={styles.filterButtonText}>Bộ lọc</Text>
        </TouchableOpacity>
      </View>
      
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
      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              minHeight: 400,
              maxHeight: '80%',
            }}
          >
            <ScrollView>
              <Text style={styles.filterTitle}>Bộ lọc studio</Text>
              <Text>Giá tối thiểu</Text>
              <TextInput
                value={filters.minPrice}
                onChangeText={text => setFilters(f => ({ ...f, minPrice: text }))}
                placeholder="Giá từ"
                keyboardType="numeric"
                style={styles.input}
              />
              <Text>Giá tối đa</Text>
              <TextInput
                value={filters.maxPrice}
                onChangeText={text => setFilters(f => ({ ...f, maxPrice: text }))}
                placeholder="Giá đến"
                keyboardType="numeric"
                style={styles.input}
              />
              <Text>Điểm đánh giá tối thiểu (1-5)</Text>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFilters((f) => ({ ...f, minRating: String(star) }))}
                  >
                    <Ionicons
                      name={Number(filters.minRating) >= star ? 'star' : 'star-outline'}
                      size={28}
                      color="#FFD700"
                      style={{ marginRight: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text>Điểm đánh giá tối đa (1-5)</Text>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFilters((f) => ({ ...f, maxRating: String(star) }))}
                  >
                    <Ionicons
                      name={Number(filters.maxRating) >= star ? 'star' : 'star-outline'}
                      size={28}
                      color="#FFD700"
                      style={{ marginRight: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text>Địa điểm</Text>
              <TextInput
                value={filters.location}
                onChangeText={text => setFilters(f => ({ ...f, location: text }))}
                placeholder="Nhập địa điểm (ví dụ: Hà Nội, TP.HCM, ...)"
                style={styles.input}
              />
              <View style={{ marginTop: 10 }}>
                <Button title="Áp dụng" color={theme.colors.primary} onPress={() => handleFilter(filters)} />
                <View style={{ height: 8 }} />
                <Button title="Đóng" color="gray" onPress={() => setFilterVisible(false)} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginRight: 8,
  },
  searchBtn: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 8,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sortOptionsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  sortBtn: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  sortBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterRow: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    elevation: 3,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
    backgroundColor: '#f0f0f0',
  },
  name: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  ratingCount: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.lightText,
    marginLeft: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  typeBtn: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  typeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  price: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: theme.spacing.xs,
  },
  sortDirGroup: {
    flexDirection: 'row',
  },
})

export default AllStudio