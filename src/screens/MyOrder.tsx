import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Linking from 'expo-linking';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [pendingFilterStatus, setPendingFilterStatus] = useState<string>(filterStatus);

  const statusOptions = [
    'Tất cả',
    'chưa thanh toán', 
    'đã thanh toán',
    'chờ xác nhận',
    'đã xác nhận',
    'đã hoàn thành',
    'đang thực hiện',
    'đã hủy',
    'đã hủy - quá hạn thanh toán',
    'đã hủy - người dùng tự hủy',
    'đã hủy - vendor từ chối',
    
  ];

  const fetchInvoices = async (refresh = false, page = currentPage, status = filterStatus) => {
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
      // Build API URL with pagination and filter
      let url = `${process.env.EXPO_PUBLIC_API_URL}/invoices/user/${userId}?current=${page}&pageSize=${pageSize}&sortBy=issuedAt&sortDirection=desc`;
      if (status && status !== 'Tất cả') {
        url += `&status=${encodeURIComponent(status)}`;
      }
      // Make API request
      const response = await axios.get(url, { headers });
      const result = response.data as InvoicesResponse;
      if (result.statusCode === 200) {
        setInvoices(result.data.data);
        setTotalPage(result.data.pagination.totalPage);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterStatus]);

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
      case 'hoàn thành':
        return '#4CAF50'; // Green
      case 'chờ thanh toán':
      case 'chưa thanh toán':
      case 'chưa trả tiền':
      case 'unpaid':
        return '#FF9800'; // Orange
      case 'đã hủy':
      case 'thất bại':
      case 'đã hủy - quá hạn thanh toán':
        return '#F44336'; // Red
      case 'chờ xử lý':
      case 'đang xử lý':
        return '#2196F3'; // Blue
      case 'đang chờ xác nhận':
        return '#9C27B0'; // Purple
      default:
        return '#9E9E9E'; // Grey
    }
  };

  // Helper: check if status is unpaid
  const isUnpaidStatus = (status: string) => {
    const s = status.toLowerCase();
    return [
      'chờ thanh toán',
      'chưa thanh toán',
      'chưa trả tiền',
      'unpaid',
    ].includes(s);
  };

  // Payment handler
  const handlePayInvoice = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId);
    setError(null);
    try {
      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : {};
      // Get access token
      const accessToken = await AsyncStorage.getItem('access_token') || userData?.access_token || userData?.accessToken;
      if (!accessToken) throw new Error('Authentication token not found');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      };
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/payments/${invoiceId}/payos/link`,
        {},
        { headers }
      );
      const result = response.data;
      if (result.statusCode === 201 && result.data?.checkoutUrl) {
        // Open checkoutUrl in a new Chrome tab
        Linking.openURL(result.data.checkoutUrl);
      } else {
        throw new Error(result.message || 'Không thể tạo liên kết thanh toán');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo liên kết thanh toán');
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const renderItem = ({ item }: { item: Invoice }) => {
    const bookingStatus = item.booking.status;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.bookingCode}>{item.booking.code}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bookingStatus) }]}> 
            <Text style={styles.statusText}>{bookingStatus}</Text>
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
        {/* Thanh toán button: hiện nếu là trạng thái chưa thanh toán */}
        {isUnpaidStatus(bookingStatus) && (
          <TouchableOpacity
            style={[styles.detailButton, { backgroundColor: '#f6ac69', marginTop: 0 }]}
            onPress={() => handlePayInvoice(item.id)}
            disabled={payingInvoiceId === item.id}
          >
            {payingInvoiceId === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.detailButtonText, { color: '#fff' }]}>Thanh toán</Text>
            )}
            <Ionicons name="card-outline" size={16} color="#fff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
      {/* Filter icon button */}
      <View style={styles.filterIconBar}>
        <TouchableOpacity
          style={styles.filterIconButton}
          onPress={() => {
            setPendingFilterStatus(filterStatus);
            setFilterModalVisible(true);
          }}
        >
          <Ionicons name="filter" size={20} color="#f6ac69" />
          <Text style={styles.filterIconLabel} numberOfLines={1}>
            {filterStatus === 'Tất cả' ? 'Lọc' : filterStatus}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Filter modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lọc theo trạng thái</Text>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.modalOption, pendingFilterStatus === status && styles.modalOptionActive]}
                onPress={() => setPendingFilterStatus(status)}
              >
                <Text style={[styles.modalOptionText, pendingFilterStatus === status && styles.modalOptionTextActive]}>{status}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalButtonText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonApply]}
                onPress={() => {
                  setFilterStatus(pendingFilterStatus);
                  setCurrentPage(1);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonApplyText]}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
      {/* <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={styles.headerRight} />
      </View> */}

      {invoices.length === 0 && !loading ? (
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
              onRefresh={() => fetchInvoices(true, 1, filterStatus)}
              colors={['#f6ac69']}
            />
          }
          ListFooterComponent={
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Text style={styles.pageButtonText}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>{`Trang ${currentPage} / ${totalPage}`}</Text>
              <TouchableOpacity
                style={[styles.pageButton, currentPage === totalPage && styles.pageButtonDisabled]}
                onPress={() => currentPage < totalPage && setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPage}
              >
                <Text style={styles.pageButtonText}>{'>'}</Text>
              </TouchableOpacity>
            </View>
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
  filterBar: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#f6ac69',
  },
  filterButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  pageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 8,
  },
  pageButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  pageButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '700',
  },
  pageInfo: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  filterIconBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  filterIconLabel: {
    marginLeft: 8,
    color: '#f6ac69',
    fontWeight: '600',
    maxWidth: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 300,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalOptionActive: {
    backgroundColor: '#f6ac69',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  modalOptionTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginLeft: 8,
  },
  modalButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonApply: {
    backgroundColor: '#f6ac69',
  },
  modalButtonApplyText: {
    color: '#fff',
  },
});

export default MyOrder; 