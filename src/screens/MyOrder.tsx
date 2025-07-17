import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Define types for navigation
type RootStackParamList = {
  MyOrder: undefined;
  OrderDetail: { invoiceId: string };
  // Add other screens as needed
};

// Define the types for the API response
interface Invoice {
  id: string;
  bookingId: string;
  payablePrice: number;
  depositAmount: number;
  remainingAmount: number;
  status: string;
  issuedAt: string;
  booking: {
    date: string;
    time: string | null;
    code: string;
    status: string;
    serviceConcept: {
      name: string;
      price: string;
      servicePackage: {
        name: string;
      };
    };
  };
}

interface InvoicesResponse {
  statusCode: number;
  message: string;
  data: {
    data: Invoice[];
    pagination: {
      current: number;
      pageSize: number;
      totalPage: number;
      totalItem: number;
    };
  };
}

const MyOrder = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fetchInvoices = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : {};
      const userId = userData?.id;

      if (!userId) {
        throw new Error('User ID not found');
      }

      // Get access token
      const accessToken = await AsyncStorage.getItem('access_token') || userData?.access_token || userData?.accessToken;
      
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      // Set up headers with access token
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      };

      // Make API request
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/invoices/user/${userId}?current=1&pageSize=10&sortBy=issuedAt&sortDirection=desc`,
        { headers }
      );

      const result = response.data as InvoicesResponse;
      
      if (result.statusCode === 200) {
        setInvoices(result.data.data);
      } else {
        throw new Error(result.message || 'Failed to fetch invoices');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching your orders');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đã thanh toán một phần':
      case 'đã thanh toán':
        return '#4CAF50'; // Green
      case 'chờ thanh toán':
        return '#FF9800'; // Orange
      case 'đã hủy':
      case 'thất bại':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const renderItem = ({ item }: { item: Invoice }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.bookingCode}>{item.booking.code}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.conceptName}>{item.booking.serviceConcept.name}</Text>
        <Text style={styles.packageName}>{item.booking.serviceConcept.servicePackage.name}</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {item.booking.date ? formatDate(item.booking.date) : 'N/A'}
            {item.booking.time ? ` lúc ${item.booking.time.substring(0, 5)}` : ''}
          </Text>
        </View>
        
        <View style={styles.priceInfo}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tổng thanh toán:</Text>
            <Text style={styles.priceValue}>{formatPrice(item.payablePrice)}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Đã thanh toán:</Text>
            <Text style={styles.depositValue}>{formatPrice(item.depositAmount)}</Text>
          </View>
          
          {item.remainingAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Còn lại:</Text>
              <Text style={styles.remainingValue}>{formatPrice(item.remainingAmount)}</Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.detailButton}
        onPress={() => navigation.navigate('OrderDetail', { invoiceId: item.id })}
      >
        <Text style={styles.detailButtonText}>Xem chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color="#f6ac69" />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f6ac69" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchInvoices()}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={styles.headerRight} />
      </View> */}

      {invoices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={70} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào được tạo</Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchInvoices(true)}
              colors={['#f6ac69']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bookingCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  conceptName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  packageName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceInfo: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  depositValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
  },
  remainingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFAF3',
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f6ac69',
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f6ac69',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default MyOrder; 