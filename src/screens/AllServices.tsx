import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput, Button, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/service-packages/filter`;
const SERVICE_TYPE_API = `${process.env.EXPO_PUBLIC_API_URL}/service-packages/service-type`;

type NavigationProp = {
  navigate: (screen: string, params?: any) => void
};

const defaultParams: {
  name: string;
  minPrice: string;
  maxPrice: string;
  serviceTypeIds: string[];
  status: string;
  current: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
} = {
  name: '',
  minPrice: '',
  maxPrice: '',
  serviceTypeIds: [],
  status: 'hoạt động',
  current: 1,
  pageSize: 10,
  sortBy: 'price',
  sortDirection: 'asc',
};

const sortOptions = [
  { label: 'Giá', value: 'price' },
  { label: 'Tên', value: 'name' },
];
const sortDirOptions = [
  { label: 'Tăng dần', value: 'asc' },
  { label: 'Giảm dần', value: 'desc' },
];

const AllServices = () => {
  const navigation = useNavigation<NavigationProp>();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [params, setParams] = useState(defaultParams);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, totalPage: 1, totalItem: 0 });
  const [filterVisible, setFilterVisible] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Fetch service types when open filter
  useEffect(() => {
    if (filterVisible && serviceTypes.length === 0) {
      fetchServiceTypes();
    }
  }, [filterVisible]);

  const fetchServiceTypes = async () => {
    try {
      const res = await axios.get(SERVICE_TYPE_API);
      setServiceTypes(res.data?.data?.data || []);
    } catch (e) {
      setServiceTypes([]);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [params.current, params.pageSize, params.name, params.minPrice, params.maxPrice, params.serviceTypeIds, params.sortBy, params.sortDirection]);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)) {
          if (Array.isArray(value)) {
            value.forEach((v) => urlParams.append(key, String(v)));
          } else {
            urlParams.append(key, String(value));
          }
        }
      });
      const response = await axios.get(`${API_URL}?${urlParams}`);
      const data = response.data?.data;
      setServices(data?.data || []);
      setPagination(data?.pagination || { current: 1, pageSize: 10, totalPage: 1, totalItem: 0 });
    } catch (e) {
      setError('Lỗi tải dịch vụ');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = () => {
    setParams((p) => ({ ...p, name: search, current: 1 }));
  };

  // Sort handler
  const handleSort = (sortBy: string) => {
    setParams((p) => ({ ...p, sortBy, current: 1 }));
  };
  const handleSortDir = (sortDirection: string) => {
    setParams((p) => ({ ...p, sortDirection, current: 1 }));
  };

  // Filter handler
  const handleFilter = (newParams: any) => {
    setParams((p) => ({
      ...p,
      minPrice: newParams.minPrice,
      maxPrice: newParams.maxPrice,
      serviceTypeIds: newParams.serviceTypeIds,
      current: 1,
    }));
    setFilterVisible(false);
  };

  // Toggle service type
  const toggleServiceType = (id: string) => {
    setParams((p) => {
      const exists = p.serviceTypeIds.includes(id);
      return {
        ...p,
        serviceTypeIds: exists ? p.serviceTypeIds.filter((sid: string) => sid !== id) : [...p.serviceTypeIds, id],
      };
    });
  };

  // Handle service item press
  const handleServicePress = (item: any) => {
    // If vendor data exists and has slug, navigate to Detail screen with the slug
    if (item.vendor && item.vendor.slug) {
      navigation.navigate('Detail', { slug: item.vendor.slug });
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleServicePress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image || 'https://via.placeholder.com/120x120' }} style={styles.image} />
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.price}>
        {item.minPrice === item.maxPrice
          ? `${item.minPrice.toLocaleString()}₫`
          : `${item.minPrice.toLocaleString()}₫ - ${item.maxPrice.toLocaleString()}₫`}
      </Text>
      {/* Vendor name display */}
      {item.vendor && item.vendor.name && (
        <Text style={styles.vendorName} numberOfLines={1}>
          {item.vendor.name}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search box */}
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm dịch vụ..."
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
              style={[styles.sortBtn, params.sortBy === opt.value && styles.sortBtnActive]}
              onPress={() => handleSort(opt.value)}
            >
              <Text style={{ color: params.sortBy === opt.value ? '#fff' : theme.colors.text }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          {sortDirOptions.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortBtn, params.sortDirection === opt.value && styles.sortBtnActive]}
              onPress={() => handleSortDir(opt.value)}
            >
              <Text style={{ color: params.sortDirection === opt.value ? '#fff' : theme.colors.text }}>{opt.label}</Text>
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
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      ) : (
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={pagination.current <= 1}
          onPress={() => setParams({ ...params, current: pagination.current - 1 })}
          style={[styles.pageBtn, pagination.current <= 1 && { opacity: 0.5 }]}
        >
          <Text>Trước</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>{pagination.current} / {pagination.totalPage}</Text>
        <TouchableOpacity
          disabled={pagination.current >= pagination.totalPage}
          onPress={() => setParams({ ...params, current: pagination.current + 1 })}
          style={[styles.pageBtn, pagination.current >= pagination.totalPage && { opacity: 0.5 }]}
        >
          <Text>Sau</Text>
        </TouchableOpacity>
      </View>
      
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
              <Text style={styles.filterTitle}>Bộ lọc dịch vụ</Text>
              <Text>Giá tối thiểu</Text>
              <TextInput
                value={params.minPrice.toString()}
                onChangeText={text => setParams(p => ({ ...p, minPrice: text }))}
                placeholder="Giá từ"
                keyboardType="numeric"
                style={styles.input}
              />
              <Text>Giá tối đa</Text>
              <TextInput
                value={params.maxPrice.toString()}
                onChangeText={text => setParams(p => ({ ...p, maxPrice: text }))}
                placeholder="Giá đến"
                keyboardType="numeric"
                style={styles.input}
              />
              <Text>Loại dịch vụ</Text>
              {serviceTypes.length === 0 ? (
                <Text>Đang tải...</Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                  {serviceTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeBtn,
                        params.serviceTypeIds.includes(type.id) && styles.typeBtnActive,
                      ]}
                      onPress={() => toggleServiceType(type.id)}
                    >
                      <Text style={{ color: params.serviceTypeIds.includes(type.id) ? '#fff' : theme.colors.text }}>{type.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={{ marginTop: 10 }}>
                <Button title="Áp dụng" color={theme.colors.primary} onPress={() => handleFilter(params)} />
                <View style={{ height: 8 }} />
                <Button title="Đóng" color="gray" onPress={() => setFilterVisible(false)} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.md,
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
  filterIconBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
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
    alignItems: 'flex-start',
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
  price: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: theme.spacing.xs,
  },
  vendorName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.lightText,
    marginTop: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  pageInfo: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
  },
  filterTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

export default AllServices; 