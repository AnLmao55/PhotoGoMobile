import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// Define the types for the API response
interface Payment {
  id: string;
  amount: string;
  paymentMethod: string;
  status: string;
  type: string;
  transactionId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: string;
  bookingId: string;
  voucherId: string | null;
  originalPrice: number;
  discountAmount: number;
  discountedPrice: number;
  taxAmount: number;
  feeAmount: number;
  payablePrice: number;
  depositAmount: number;
  remainingAmount: number;
  paidAmount: number;
  status: string;
  issuedAt: string;
  updatedAt: string;
  booking: {
    id: string;
    userId: string;
    locationId: string;
    serviceConceptId: string;
    date: string;
    time: string | null;
    status: string;
    sourceType: string;
    depositAmount: string;
    depositType: string;
    userNote: string;
    fullName: string;
    phone: string;
    email: string;
    code: string;
    bookingType: string;
    created_at: string;
    updated_at: string;
    serviceConcept: {
      id: string;
      name: string;
      description: string;
      price: string;
      duration: number;
      conceptRangeType: string;
      numberOfDays: number;
      status: string;
      servicePackage: {
        id: string;
        name: string;
        description: string;
        image: string;
      };
    };
  };
  payments: Payment[];
}

type ParamList = {
  OrderDetail: {
    invoiceId: string;
  };
};

const OrderDetail = () => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'OrderDetail'>>();
  const { invoiceId } = route.params;

  useEffect(() => {
    fetchInvoiceDetail();
  }, [invoiceId]);

  const fetchInvoiceDetail = async () => {
    setLoading(true);
    
    try {
      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : {};
      
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
        `${process.env.EXPO_PUBLIC_API_URL}/invoices/${invoiceId}`,
        { headers }
      );

      const result = response.data;
      
      if (result.statusCode === 200) {
        setInvoice(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch invoice details');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching order details');
      console.error('Error fetching invoice details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đã thanh toán một phần':
      case 'đã thanh toán':
      case 'đã hoàn thành':
        return '#4CAF50'; // Green
      case 'chờ thanh toán':
      case 'chờ xử lý':
        return '#FF9800'; // Orange
      case 'đã hủy':
      case 'thất bại':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f6ac69" />
        <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
      </View>
    );
  }

  if (error || !invoice) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#F44336" />
        <Text style={styles.errorText}>{error || 'Không thể tải thông tin đơn hàng'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchInvoiceDetail}>
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
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.headerRight} />
      </View> */}

      <ScrollView style={styles.scrollContainer}>
        {/* Order Status Card */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
              <Text style={styles.statusText}>{invoice.status}</Text>
            </View>
            <Text style={styles.orderCode}>Mã đơn: {invoice.booking.code}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dịch vụ:</Text>
              <Text style={styles.infoValue}>{invoice.booking.serviceConcept.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Loại dịch vụ:</Text>
              <Text style={styles.infoValue}>{invoice.booking.serviceConcept.servicePackage.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày đặt:</Text>
              <Text style={styles.infoValue}>{formatDate(invoice.issuedAt)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày hẹn:</Text>
              <Text style={styles.infoValue}>
                {invoice.booking.date ? formatDate(invoice.booking.date).split(',')[0] : 'N/A'}
                {invoice.booking.time ? ` ${invoice.booking.time.substring(0, 5)}` : ''}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Loại đặt lịch:</Text>
              <Text style={styles.infoValue}>{invoice.booking.bookingType}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ và tên:</Text>
              <Text style={styles.infoValue}>{invoice.booking.fullName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{invoice.booking.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Điện thoại:</Text>
              <Text style={styles.infoValue}>{invoice.booking.phone}</Text>
            </View>
            
            {invoice.booking.userNote && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ghi chú:</Text>
                <Text style={styles.infoValue}>{invoice.booking.userNote}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giá gốc:</Text>
              <Text style={styles.infoValue}>{formatPrice(invoice.originalPrice)}</Text>
            </View>
            
            {invoice.discountAmount > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Giảm giá:</Text>
                <Text style={styles.discountValue}>-{formatPrice(invoice.discountAmount)}</Text>
              </View>
            )}
            
            {invoice.taxAmount > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Thuế:</Text>
                <Text style={styles.infoValue}>{formatPrice(invoice.taxAmount)}</Text>
              </View>
            )}
            
            {invoice.feeAmount > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phí dịch vụ:</Text>
                <Text style={styles.infoValue}>{formatPrice(invoice.feeAmount)}</Text>
              </View>
            )}
            
            <View style={styles.dividerLight} />
            
            <View style={styles.infoRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>{formatPrice(invoice.payablePrice)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Đã thanh toán:</Text>
              <Text style={styles.paidValue}>{formatPrice(invoice.depositAmount)}</Text>
            </View>
            
            {invoice.remainingAmount > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Còn lại:</Text>
                <Text style={styles.remainingValue}>{formatPrice(invoice.remainingAmount)}</Text>
              </View>
            )}
          </View>

          {invoice.payments && invoice.payments.length > 0 && (
            <>
              <View style={styles.divider} />
              
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Lịch sử thanh toán</Text>
                
                {invoice.payments.map((payment, index) => (
                  <View key={payment.id} style={styles.paymentItem}>
                    <View style={styles.paymentHeader}>
                      <Text style={styles.paymentType}>{payment.type}</Text>
                      <View style={[
                        styles.paymentStatusBadge, 
                        { backgroundColor: getStatusColor(payment.status) }
                      ]}>
                        <Text style={styles.paymentStatusText}>{payment.status}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.paymentInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số tiền:</Text>
                        <Text style={styles.infoValue}>{formatPrice(parseFloat(payment.amount))}</Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phương thức:</Text>
                        <Text style={styles.infoValue}>{payment.paymentMethod}</Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mã giao dịch:</Text>
                        <Text style={styles.infoValue}>{payment.transactionId}</Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày thanh toán:</Text>
                        <Text style={styles.infoValue}>{formatDate(payment.createdAt)}</Text>
                      </View>
                    </View>
                    
                    {index < invoice.payments.length - 1 && (
                      <View style={styles.dividerLight} />
                    )}
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
    padding: 16,
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
  statusHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  orderCode: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 8,
    backgroundColor: '#F3F4F6',
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  infoSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  paidValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  remainingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  paymentItem: {
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  paymentInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
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
});

export default OrderDetail; 