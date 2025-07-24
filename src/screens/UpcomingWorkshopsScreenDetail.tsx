import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import HTML from 'react-native-render-html';
import { Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// Define the types for the API response - use same interface as OrderDetail.tsx
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

// Match the route param type to OrderDetail.tsx pattern
type ParamList = {
  UpcomingWorkshopsScreenDetail: {
    invoiceId: string;
  };
};

const UpcomingWorkshopsScreenDetail = () => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'UpcomingWorkshopsScreenDetail'>>();
  const { invoiceId } = route.params;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchInvoiceDetail();
    getUserId();
  }, [invoiceId]);

  const getUserId = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserId(userData.id || null);
      }
    } catch (err) {
      console.error('Error fetching user ID:', err);
    }
  };

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

      // Make API request - identical to OrderDetail.tsx
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
      setError(err.message || 'An error occurred while fetching workshop details');
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
    switch (status?.toLowerCase() || '') {
      case 'đã xác nhận':
      case 'confirmed':
        return ['#4CAF50', '#81C784']; // Green gradient
      case 'đang thực hiện':
      case 'in_progress':
        return ['#2196F3', '#64B5F6']; // Blue gradient
      case 'đã hoàn thành':
      case 'hoàn thành':
      case 'completed':
        return ['#9C27B0', '#BA68C8']; // Purple gradient
      case 'đã hủy':
      case 'cancelled':
        return ['#F44336', '#E57373']; // Red gradient
      default:
        return ['#9E9E9E', '#BDBDBD']; // Grey gradient
    }
  };

  const renderWorkflowProgress = () => {
    if (!invoice) return null;
    
    const steps = [
      { key: 'đã xác nhận', label: 'Đã xác nhận', icon: 'check-circle' },
      { key: 'đang thực hiện', label: 'Đang thực hiện', icon: 'camera' },
      { key: 'đã hoàn thành', label: 'Đã hoàn thành', icon: 'award' }
    ];
    
    // Determine current step based on booking status
    let currentStepIndex = -1;
    const bookingStatus = invoice.booking.status.toLowerCase();
    
    if (bookingStatus.includes('đã xác nhận')) {
      currentStepIndex = 0;
    } else if (bookingStatus.includes('đang thực hiện')) {
      currentStepIndex = 1;
    } else if (bookingStatus.includes('đã hoàn thành') || bookingStatus.includes('hoàn thành')) {
      currentStepIndex = 2;
    }

    return (
      <View style={styles.workflowContainer}>
        
        <Text style={styles.sectionTitle}>Lộ trình thực hiện</Text>
        
        <View style={styles.progressTracker}>
          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isLast = index === steps.length - 1;
            
            return (
              <View key={step.key} style={styles.stepContainer}>
                <View style={styles.stepItem}>
                  <View style={[
                    styles.stepCircle,
                    isActive ? styles.activeStepCircle : styles.inactiveStepCircle
                  ]}>
                    <FontAwesome5
                      name={step.icon}
                      size={18}
                      color={isActive ? '#FFF' : '#BDBDBD'}
                    />
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    isActive ? styles.activeStepLabel : styles.inactiveStepLabel
                  ]}>
                    {step.label}
                  </Text>
                </View>
                
                {!isLast && (
                  <View style={[
                    styles.stepConnector,
                    isActive && index < currentStepIndex ? styles.activeStepConnector : styles.inactiveStepConnector
                  ]} />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Function to truncate the description
  const getShortDescription = (description: string) => {
    if (!description) return '';
    
    // If it's already short, just return it
    if (description.length <= 150) return description;
    
    // Otherwise truncate it
    return description.substring(0, 150) + '...';
  };

  // Function to generate QR code data
  const generateQRCodeData = () => {
    if (!invoice || !userId) return '';
    
    // Create a JSON object with booking code and user ID
    const qrData = {
      bookingCode: invoice.booking.code,
      userId: userId,
      bookingId: invoice.bookingId,
      invoiceId: invoice.id
    };
    
    // Convert to JSON string
    return JSON.stringify(qrData);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f6ac69" />
        <Text style={styles.loadingText}>Đang tải thông tin buổi chụp hình...</Text>
      </View>
    );
  }

  if (error || !invoice) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#F44336" />
        <Text style={styles.errorText}>{error || 'Không thể tải thông tin buổi chụp hình'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchInvoiceDetail}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header Image with Gradient Overlay */}
        <View style={styles.headerImageContainer}>
          <Image
            source={{ 
              uri: invoice.booking.serviceConcept.servicePackage.image || 'https://example.com/default-image.jpg'
            }}
            style={styles.headerImage}
            defaultSource={require('../../assets/logotrang.png')}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          >
            <Text style={styles.workshopTitle}>{invoice.booking.serviceConcept.name}</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(invoice.booking.status)[0] }
            ]}>
              <Text style={styles.statusText}>{invoice.booking.status}</Text>
            </View>
          </LinearGradient>
        </View>
        
        
        {/* Workshop Details Card */}
        <View style={styles.card}>
        <View style={styles.priceSection}>
              <Text style={styles.priceSectionTitle}>Gói dịch vụ</Text>
              <Text style={styles.priceValue}>{invoice.booking.serviceConcept.servicePackage.name}</Text>
            </View>
          <View style={styles.infoSection}>
            <View style={styles.workshopHeaderInfo}>
              <View style={styles.infoChip}>
                <Ionicons name="calendar-outline" size={16} color="#f6ac69" />
                <Text style={styles.infoChipText}>
                  {invoice.booking.date ? formatDate(invoice.booking.date).split(',')[0] : 'N/A'}
                </Text>
              </View>
              <View style={styles.infoChip}>
                <Ionicons name="time-outline" size={16} color="#f6ac69" />
                <Text style={styles.infoChipText}>
                  {invoice.booking.time ? invoice.booking.time.substring(0, 5) : 'N/A'}
                </Text>
              </View>
              <View style={styles.infoChip}>
                <Ionicons name="pricetag-outline" size={16} color="#f6ac69" />
                <Text style={styles.infoChipText}>
                  {formatPrice(invoice.payablePrice)}
                </Text>
              </View>
            </View>
            <View style={styles.dividerStyled} />
            
            <View style={styles.locationContainer}>
              <Text style={styles.sectionTitle}>Địa điểm</Text>
              <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={20} color="#f6ac69" />
                <Text style={styles.locationText}>
                  {invoice.booking.locationId ? `Studio ID: ${invoice.booking.locationId}` : 'Vui lòng liên hệ để biết địa điểm chính xác'}
                </Text>
              </View>
            </View>
            
            <View style={styles.dividerStyled} />
            <View style={styles.photographerInfo}>
              <Ionicons name="person-circle-outline" size={24} color="#333" />
              <Text style={styles.photographerName}>{invoice.booking.fullName}</Text>
              <Text style={styles.photographerTitle}>Khách hàng</Text>
            </View>
            
            <View style={styles.dividerStyled} />
            
            <Text style={styles.sectionTitle}>Thông tin concept</Text>
            
            <View style={styles.conceptContainer}>
              {invoice.booking.serviceConcept.description ? (
                <>
                  <HTML 
                    source={{ html: showFullDescription ? 
                      invoice.booking.serviceConcept.description : 
                      getShortDescription(invoice.booking.serviceConcept.description) 
                    }} 
                    contentWidth={screenWidth - 40}
                    tagsStyles={{
                      p: styles.htmlParagraph,
                      li: styles.htmlListItem,
                      ul: styles.htmlList,
                      ol: styles.htmlList,
                      h1: styles.htmlHeading1,
                      h2: styles.htmlHeading2,
                      h3: styles.htmlHeading3,
                    }}
                  />
                  
                  {invoice.booking.serviceConcept.description.length > 150 && (
                    <TouchableOpacity 
                      style={styles.readMoreButton}
                      onPress={() => setShowFullDescription(!showFullDescription)}
                    >
                      <Text style={styles.readMoreText}>
                        {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                      </Text>
                      <Ionicons 
                        name={showFullDescription ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color="#f6ac69" 
                      />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text style={styles.noDescriptionText}>Không có thông tin mô tả</Text>
              )}
            </View>
            
            
            
            {/* Workflow Progress */}
            {renderWorkflowProgress()}
            
            <View style={styles.dividerStyled} />
            
            {/* Booking Information */}
            {/* <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã đơn:</Text>
              <Text style={styles.infoValue}>{invoice.booking.code}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày đặt:</Text>
              <Text style={styles.infoValue}>{formatDate(invoice.issuedAt)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Loại đặt lịch:</Text>
              <Text style={styles.infoValue}>{invoice.booking.bookingType}</Text>
            </View>
            
            {invoice.booking.userNote && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ghi chú:</Text>
                <Text style={styles.infoValue}>{invoice.booking.userNote}</Text>
              </View>
            )}
            
            <View style={styles.dividerStyled} /> */}
            
            {/* Payment Information */}
            {/* <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
            
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
            )} */}
            
            {/* <View style={styles.dividerLight} /> */}
            
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
            
            {/* <View style={styles.dividerStyled} /> */}
            
            <View style={styles.dividerStyled} />
            
            <Text style={styles.sectionTitle}>Mã check-in</Text>
            <View style={styles.qrCodeContainer}>
              {userId ? (
                <>
                  <QRCode
                    value={generateQRCodeData()}
                    size={200}
                    color="#000000"
                    backgroundColor="#ffffff"
                  />
                  <Text style={styles.qrCodeCaption}>
                    Quét mã này để check-in khi đến buổi chụp
                  </Text>
                </>
              ) : (
                <Text style={styles.loadingText}>Đang tải mã QR...</Text>
              )}
            </View>
            
          </View>
        </View>
      </ScrollView>
      
      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => {
            // Handle contact action
          }}
        >
          <Text style={styles.contactButtonText}>Liên hệ với chúng tôi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  headerImageContainer: {
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  workshopTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoSection: {
    padding: 20,
  },
  workshopHeaderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  infoChipText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  photographerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  photographerName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  photographerTitle: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  dividerStyled: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    textAlign: 'justify',
  },
  locationContainer: {
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#4B5563',
  },
  workflowContainer: {
    marginBottom: 4,
  },
  progressTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepItem: {
    alignItems: 'center',
    width: '100%',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: '#f6ac69',
  },
  inactiveStepCircle: {
    backgroundColor: '#F1F1F1',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeStepLabel: {
    fontWeight: '600',
    color: '#111827',
  },
  inactiveStepLabel: {
    color: '#9CA3AF',
  },
  stepConnector: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: 0,
    height: 2,
    width: '100%',
    zIndex: -1,
  },
  activeStepConnector: {
    backgroundColor: '#f6ac69',
  },
  inactiveStepConnector: {
    backgroundColor: '#E5E7EB',
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
  agendaContainer: {
    marginTop: 10,
  },
  agendaItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  agendaTimeContainer: {
    width: 100,
    marginRight: 15,
  },
  agendaTime: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  agendaContentContainer: {
    flex: 1,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  agendaActivity: {
    fontSize: 15,
    color: '#111827',
  },
  equipmentContainer: {
    marginTop: 10,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  equipmentText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#4B5563',
  },
  priceSection: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f6ac69',
  },
  footer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  contactButton: {
    backgroundColor: '#f6ac69',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  conceptContainer: {
    backgroundColor: '#FEFEFE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noDescriptionText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f6ac69',
    marginRight: 5,
  },
  htmlParagraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 10,
  },
  htmlList: {
    marginLeft: 10,
    marginBottom: 10,
  },
  htmlListItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 5,
  },
  htmlHeading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 5,
  },
  htmlHeading2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    marginTop: 5,
  },
  htmlHeading3: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
    marginTop: 5,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
  },
  qrCodeCaption: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default UpcomingWorkshopsScreenDetail;
