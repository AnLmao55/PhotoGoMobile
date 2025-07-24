import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Calendar, DateData } from 'react-native-calendars';

// Define types for navigation
type RootStackParamList = {
  UpcomingWorkshops: undefined;
  UpcomingWorkshopsScreenDetail: { invoiceId: string };
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

const UpcomingWorkshopsScreen = () => {
  const [workshops, setWorkshops] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Calendar states
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<{[date: string]: any}>({});
  const [filteredWorkshops, setFilteredWorkshops] = useState<Invoice[]>([]);
  
  // Include all relevant statuses for workshops
  const workshopStatuses = ["đã xác nhận", "đã hoàn thành", "đang thực hiện"];

  const fetchWorkshops = async (refresh = false, page = currentPage) => {
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
      
      // Make separate API calls for each status and collect all results
      let allWorkshops: Invoice[] = [];
      let maxTotalPage = 1;
      
      // Process each status one by one
      for (const status of workshopStatuses) {
        // Build API URL for this specific status
        let url = `${process.env.EXPO_PUBLIC_API_URL}/invoices/user/${userId}?current=${page}&pageSize=${pageSize}&sortBy=issuedAt&sortDirection=desc&status=${encodeURIComponent(status)}`;
        
        // Make API request for this status
        const response = await axios.get(url, { headers });
        const result = response.data as InvoicesResponse;
        
        if (result.statusCode === 200) {
          // Add these results to our combined array
          allWorkshops = [...allWorkshops, ...result.data.data];
          
          // Keep track of the highest total page count among all status requests
          if (result.data.pagination.totalPage > maxTotalPage) {
            maxTotalPage = result.data.pagination.totalPage;
          }
        }
      }
      
      // Sort all workshops by issuedAt date (newest first)
      allWorkshops.sort((a, b) => 
        new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
      );
      
      setWorkshops(allWorkshops);
      setTotalPage(maxTotalPage);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching your workshops');
      console.error('Error fetching workshops:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Filter workshops when data or selected date changes
  useEffect(() => {
    if (workshops.length > 0) {
      updateMarkedDates();
      filterWorkshopsByDate();
    }
  }, [workshops, selectedDate]);

  // Mark dates that have workshops
  const updateMarkedDates = () => {
    const dates: {[date: string]: any} = {};
    
    workshops.forEach(workshop => {
      if (workshop.booking.date) {
        const date = workshop.booking.date.split('T')[0];
        dates[date] = {
          marked: true,
          dotColor: getStatusColor(workshop.booking.status)
        };
      }
    });
    
    // Highlight selected date
    if (selectedDate) {
      dates[selectedDate] = {
        ...dates[selectedDate],
        selected: true,
        selectedColor: '#f6ac69',
      };
    }
    
    setMarkedDates(dates);
  };

  // Filter workshops by selected date
  const filterWorkshopsByDate = () => {
    if (!selectedDate) {
      setFilteredWorkshops(workshops);
      return;
    }
    
    const filtered = workshops.filter(workshop => {
      if (!workshop.booking.date) return false;
      return workshop.booking.date.split('T')[0] === selectedDate;
    });
    
    setFilteredWorkshops(filtered);
  };

  // Handle date selection on calendar
  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

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
      case 'hoàn thành':
      case 'đã hoàn thành':
        return '#4CAF50'; // Green for completed
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
      case 'đang thực hiện':
        return '#2196F3'; // Blue
      case 'đã xác nhận':
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
          {/* <View style={styles.priceInfo}>
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
          </View> */}
        </View>
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={() => navigation.navigate('UpcomingWorkshopsScreenDetail', { invoiceId: item.id })}
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

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f6ac69" />
          <Text style={styles.loadingText}>Đang tải danh sách lịch...</Text>
          <Text style={styles.loadingSubText}>Đang kiểm tra các lịch chụp ảnh đã xác nhận, đang thực hiện và đã hoàn thành</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchWorkshops()}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchWorkshops(true, 1)}
              colors={['#f6ac69']}
            />
          }
        >
          {/* Calendar Section */}
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={{
                todayTextColor: '#f6ac69',
                arrowColor: '#f6ac69',
                dotColor: '#f6ac69',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14
              }}
            />
          </View>

          {/* Selected Date Header */}
          <View style={styles.selectedDateContainer}>
            <Ionicons name="calendar" size={20} color="#6B7280" />
            <Text style={styles.selectedDateText}>
              {selectedDate ? formatDate(selectedDate) : 'Tất cả ngày'}
            </Text>
            <TouchableOpacity 
              style={styles.clearDateButton} 
              onPress={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              <Text style={styles.clearDateText}>Hôm nay</Text>
            </TouchableOpacity>
          </View>

          {/* Workshop List Section */}
          {filteredWorkshops.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={70} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Không có buổi chụp hình nào</Text>
              <Text style={styles.emptyText}>
                Không có buổi chụp hình nào vào ngày {formatDate(selectedDate)}
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredWorkshops.map((item) => (
                <View key={item.id}>
                  {renderItem({ item })}
                </View>
              ))}
              
              {/* Pagination if needed */}
              {totalPage > 1 && (
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
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
  loadingSubText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
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
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  calendarContainer: {
    padding: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 0,
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  clearDateButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  clearDateText: {
    fontSize: 14,
    color: '#f6ac69',
    fontWeight: '500',
  },
});

export default UpcomingWorkshopsScreen;
