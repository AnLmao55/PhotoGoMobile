import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosPrivate } from '../../config/config';

const { width } = Dimensions.get('window');

// Convert API month (1-12) to JS month (0-11)
const apiToJsMonth = (apiMonth: number) => apiMonth - 1;

// Convert JS month (0-11) to API month (1-12)
const jsToApiMonth = (jsMonth: number) => jsMonth + 1;

// Format date to dd/mm/yyyy for API requests (using full year)
const formatDateForApi = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString(); // Use full 4-digit year
  return `${day}/${month}/${year}`;
};

// URL encode date for API requests
const encodeDate = (dateString: string) => {
  return encodeURIComponent(dateString);
};

// Parse API date format (YYYY-MM-DD) to JS Date
const parseApiDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper functions
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Interface for vendor location
interface VendorLocation {
  id: string;
  address: string;
  district: string;
  ward: string;
  city: string;
  province: string;
  latitude: string;
  longitude: string;
}

// Interface for vendor data
interface VendorData {
  id: string;
  name: string;
  locations: VendorLocation[];
}

// Interface for booking data
interface Booking {
  id: string;
  fullName: string;
  status: string;
  service: string;
  notes: string;
  phone: string;
  email: string;
  userId: string;
  alreadyPaid: number;
  remain: number;
  total: number;
}

// Interface for slot data
interface Slot {
  date: string;
  from: string;
  to: string;
  count: number;
  bookings: Booking[];
}

// Interface for schedule data
interface ScheduleData {
  slots: Slot[];
  stats: {
    total: number;
    confirmed: number;
    pending: number;
    expectedRevenue: number;
  };
  todayBookings: Booking[];
}

const ScheduleScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get days in current month
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  
  // Get month name
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  
  // Display the API month number (1-12) instead of JS month (0-11)
  const displayMonth = jsToApiMonth(currentMonth);
  
  // Days of week
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  
  // Add this import at the top of the file
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.photogo.id.vn/api/v1';

  // Fetch vendor data on component mount
  useEffect(() => {
    fetchVendorData();
  }, []);

  // Fetch schedule data when locationId changes or month changes
  useEffect(() => {
    if (locationId) {
      fetchScheduleData();
    }
  }, [locationId, currentMonth, currentYear]);

  // Function to fetch vendor data from API
  const fetchVendorData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found');
      }
      
      const userData = JSON.parse(userDataString);
      const userId = userData.id;
      const accessToken = userData.access_token || await AsyncStorage.getItem('access_token');
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      console.log('Vendor API Request:', {
        userId,
        hasAccessToken: !!accessToken,
        apiUrl: API_URL
      });
      
      // Make API request to get vendor data
      const response = await axios.get(
        `${API_URL}/vendors/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      const { data } = response.data;
      setVendorData(data);
      
      // Extract location ID if available
      if (data.locations && data.locations.length > 0) {
        setLocationId(data.locations[0].id);
        console.log('Location ID:', data.locations[0].id);
      } else {
        console.log('No locations found for this vendor');
      }
      
    } catch (err: any) {
      console.error('Error fetching vendor data:', err);
      
      // Log more detailed error information
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request type:', typeof err.request);
        console.error('Error request:', JSON.stringify(err.request).substring(0, 500));
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
      }
      
      // Check for common issues
      if (err.message && err.message.includes('Network Error')) {
        setError('Network error. Please check your internet connection.');
      } else if (err.response && err.response.status === 401) {
        setError('Authentication error. Please log in again.');
      } else if (err.response && err.response.status === 404) {
        setError('Vendor data not found. You may need to create a vendor profile.');
      } else {
        setError(err.message || 'Failed to fetch vendor data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch schedule data from API
  const fetchScheduleData = async () => {
    if (!locationId) {
      console.log('Cannot fetch schedule: locationId is null');
      return;
    }

    try {
      setIsLoadingSchedule(true);
      setScheduleError(null);

      // Calculate first and last day of the month
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);

      // Format dates for API
      const fromDate = formatDateForApi(firstDay);
      const toDate = formatDateForApi(lastDay);

      // Encode dates for URL
      const encodedFromDate = encodeDate(fromDate);
      const encodedToDate = encodeDate(toDate);

      // Get access token
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('Access token not found');
        throw new Error('Authentication token not found');
      }
      
      // Build the full URL with query parameters
      const fullUrl = `${API_URL}/locations/${locationId}/location-overview?from=${encodedFromDate}&to=${encodedToDate}`;
      
      // Log request parameters
      console.log('Schedule API Request:', {
        endpoint: fullUrl,
        originalDates: { from: fromDate, to: toDate },
        encodedDates: { from: encodedFromDate, to: encodedToDate },
        headers: { Authorization: `Bearer ${accessToken?.substring(0, 15)}...` }
      });

      // Make API request to get schedule data
      const response = await axios.get(
        fullUrl,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      // Check if response has the expected structure
      if (!response.data || response.data.statusCode !== 200) {
        console.error('Unexpected API response structure:', response.data);
        throw new Error('Received unexpected response from server');
      }

      const { data } = response.data;
      setScheduleData(data);
      console.log('Schedule data fetched successfully');
      console.log('Schedule stats:', data.stats);
      console.log('Number of slots:', data.slots?.length || 0);
      console.log('Today bookings:', data.todayBookings?.length || 0);
      
      // Log first slot details if available
      if (data.slots && data.slots.length > 0) {
        const firstSlot = data.slots[0];
        console.log('Sample slot:', {
          date: firstSlot.date,
          timeSlot: `${firstSlot.from} - ${firstSlot.to}`,
          bookingCount: firstSlot.count,
          bookings: firstSlot.bookings.map((b: Booking) => ({
            id: b.id,
            name: b.fullName,
            status: b.status,
            service: b.service
          }))
        });
      }

    } catch (err: any) {
      console.error('Error fetching schedule data:', err);
      
      // Log more detailed error information
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request type:', typeof err.request);
        console.error('Error request:', JSON.stringify(err.request).substring(0, 500));
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
      }
      
      // Check for common issues
      if (err.message && err.message.includes('Network Error')) {
        setScheduleError('Network error. Please check your internet connection.');
      } else if (err.response && err.response.status === 401) {
        setScheduleError('Authentication error. Please log in again.');
      } else if (err.response && err.response.status === 404) {
        setScheduleError('Schedule data not found for this location.');
      } else {
        setScheduleError(err.message || 'Failed to fetch schedule data');
      }
    } finally {
      setIsLoadingSchedule(false);
    }
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  // Select a date
  const selectDate = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };
  
  // Check if a date has appointments
  const hasAppointments = (day: number) => {
    if (!scheduleData || !scheduleData.slots) return false;
    
    const date = new Date(currentYear, currentMonth, day);
    const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    return scheduleData.slots.some(slot => slot.date === dateString);
  };
  
  // Get appointments for selected date
  const getAppointmentsForDate = () => {
    if (!scheduleData || !scheduleData.slots) return [];
    
    const dateString = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    
    const slot = scheduleData.slots.find(slot => slot.date === dateString);
    return slot ? slot.bookings : [];
  };
  
  // Format time from API (HH:MM:SS) to display format (HH:MM)
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  // Get time slot for a specific date
  const getTimeSlot = (dateString: string) => {
    if (!scheduleData || !scheduleData.slots) return null;
    
    const slot = scheduleData.slots.find(slot => slot.date === dateString);
    return slot ? `${formatTime(slot.from)} - ${formatTime(slot.to)}` : null;
  };

  // Handle booking card press
  const handleBookingPress = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  // Format date for display (e.g., "29 Tháng 7 2025")
  const formatDisplayDate = (dateString: string) => {
    const date = parseApiDate(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} Tháng ${month} ${year}`;
  };
  
  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth && 
        selectedDate.getFullYear() === currentYear;
      
      const isToday = 
        new Date().getDate() === day && 
        new Date().getMonth() === currentMonth && 
        new Date().getFullYear() === currentYear;
      
      const hasEvents = hasAppointments(day);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDayCell,
            isToday && styles.todayCell
          ]}
          onPress={() => selectDate(day)}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            isToday && styles.todayText
          ]}>
            {day}
          </Text>
          {hasEvents && <View style={styles.eventDot} />}
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  // Get status color based on booking status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đã xác nhận':
      case 'hoàn thành':
        return '#4CAF50'; // Green
      case 'chờ xác nhận':
        return '#FFC107'; // Yellow/Amber
      case 'đã hủy':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace(/\s/g, '');
  };
  
  // Function to update booking status
  const updateBookingStatus = async (newStatus: string) => {
    if (!selectedBooking) return;

    try {
      setIsUpdatingStatus(true);
      
      // Get access token
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('Access token not found');
        throw new Error('Authentication token not found');
      }
      
      // Get API URL
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
      
      // Verify API URL is defined
      if (!apiUrl) {
        console.error('API URL is undefined');
        throw new Error('API URL configuration is missing');
      }
      
      // Log request details
      console.log('Update Booking Status Request:', {
        endpoint: `${apiUrl}/bookings/${selectedBooking.id}/update-status`,
        body: { status: newStatus }
      });

      // Make API request to update booking status
      const response = await axios.patch(
        `${apiUrl}/bookings/${selectedBooking.id}/update-status`,
        {
          status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Status update response:', response.data);
      
      // Close modal and refresh schedule data
      setModalVisible(false);
      fetchScheduleData();
      
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      
      // Log more detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      } else if (err.request) {
        console.error('Error request:', JSON.stringify(err.request).substring(0, 500));
      } else {
        console.error('Error message:', err.message);
      }
      
      // Show error as alert or as a message
      setScheduleError('Không thể cập nhật trạng thái đặt lịch. Vui lòng thử lại.');
      
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Booking Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedBooking && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedBooking.service}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {selectedBooking.status}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.bookingId}>
                  ID lịch hẹn: {selectedBooking.id.substring(0, 8).toUpperCase()}...
                </Text>
                
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="person" size={20} color={theme.colors.text} />
                    <Text style={styles.modalSectionTitle}>Thông tin khách hàng</Text>
                  </View>
                  
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{selectedBooking.fullName}</Text>
                    <View style={styles.contactRow}>
                      <Ionicons name="call-outline" size={16} color={theme.colors.lightText} />
                      <Text style={styles.modalContactText}>{selectedBooking.phone}</Text>
                    </View>
                    <View style={styles.contactRow}>
                      <Ionicons name="mail-outline" size={16} color={theme.colors.lightText} />
                      <Text style={styles.modalContactText}>{selectedBooking.email}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="calendar" size={20} color={theme.colors.text} />
                    <Text style={styles.modalSectionTitle}>Chi tiết lịch hẹn</Text>
                  </View>
                  
                  <View style={styles.bookingDetailRow}>
                    <View style={styles.bookingDetailItem}>
                      <Text style={styles.bookingDetailLabel}>Ngày chụp</Text>
                      <View style={styles.bookingDetailValue}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                        <Text style={styles.bookingDetailText}>
                          {selectedDate && formatDisplayDate(selectedDate.toISOString().split('T')[0])}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.bookingDetailItem}>
                      <Text style={styles.bookingDetailLabel}>Thời gian</Text>
                      <View style={styles.bookingDetailValue}>
                        <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
                        {getTimeSlot(selectedDate.toISOString().split('T')[0]) ? (
                          <Text style={styles.bookingDetailText}>
                            {getTimeSlot(selectedDate.toISOString().split('T')[0])}
                          </Text>
                        ) : (
                          <Text style={styles.bookingDetailText}>13:00 - 17:00</Text>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  {selectedBooking.notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Ghi chú khách hàng</Text>
                      <Text style={styles.notesText}>{selectedBooking.notes}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <FontAwesome name="money" size={20} color={theme.colors.text} />
                    <Text style={styles.modalSectionTitle}>Thông tin thanh toán</Text>
                  </View>
                  
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Đã thanh toán</Text>
                      <Text style={[styles.paymentValue, styles.paidAmount]}>
                        {formatCurrency(selectedBooking.alreadyPaid)}
                      </Text>
                    </View>
                    
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Còn lại</Text>
                      <Text style={[styles.paymentValue, styles.remainingAmount]}>
                        {formatCurrency(selectedBooking.remain)}
                      </Text>
                    </View>
                    
                    <View style={[styles.paymentRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Tổng cộng</Text>
                      <Text style={styles.totalValue}>
                        {formatCurrency(selectedBooking.total)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={[styles.closeButton, 
                      (selectedBooking.status.toLowerCase() === 'đã xác nhận' || 
                      selectedBooking.status.toLowerCase() === 'đang thực hiện') ? 
                      styles.halfWidthButton : {}]} 
                    onPress={() => setModalVisible(false)}
                    disabled={isUpdatingStatus}
                  >
                    <Text style={styles.closeButtonText}>Đóng</Text>
                  </TouchableOpacity>
                  
                  {selectedBooking.status.toLowerCase() !== 'đã xác nhận' && 
                   selectedBooking.status.toLowerCase() !== 'đang thực hiện' && 
                   selectedBooking.status.toLowerCase() !== 'đã hoàn thành' && (
                    <TouchableOpacity 
                      style={styles.confirmButton}
                      onPress={() => updateBookingStatus("đã xác nhận")}
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.confirmButtonText}>Xác nhận lịch</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  
                  {selectedBooking.status.toLowerCase() === 'đã xác nhận' && (
                    <TouchableOpacity 
                      style={[styles.confirmButton, { backgroundColor: '#FF9800' }]}
                      onPress={() => updateBookingStatus("đang thực hiện")}
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.confirmButtonText}>Đang thực hiện</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  
                  {selectedBooking.status.toLowerCase() === 'đang thực hiện' && (
                    <TouchableOpacity 
                      style={[styles.confirmButton, { backgroundColor: '#4CAF50' }]}
                      onPress={() => updateBookingStatus("đã hoàn thành")}
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.confirmButtonText}>Hoàn thành</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch làm việc</Text>
        {vendorData && (
          <Text style={styles.vendorName}>{vendorData.name}</Text>
        )}
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchVendorData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={goToPreviousMonth}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
              {`${monthNames[currentMonth]} ${currentYear}`}
            </Text>
            <TouchableOpacity onPress={goToNextMonth}>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          {scheduleData && scheduleData.stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{scheduleData.stats.total}</Text>
                <Text style={styles.statLabel}>Tổng đơn</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{scheduleData.stats.confirmed}</Text>
                <Text style={styles.statLabel}>Đã xác nhận</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{scheduleData.stats.pending}</Text>
                <Text style={styles.statLabel}>Chờ xác nhận</Text>
              </View>
            </View>
          )}
          
          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map((day, index) => (
              <View key={index} style={styles.dayOfWeekCell}>
                <Text style={styles.dayOfWeekText}>{day}</Text>
              </View>
            ))}
          </View>
          
          {isLoadingSchedule ? (
            <View style={styles.calendarLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Đang tải lịch...</Text>
            </View>
          ) : scheduleError ? (
            <View style={styles.calendarErrorContainer}>
              <Text style={styles.errorText}>{scheduleError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchScheduleData}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.calendarGrid}>
              {renderCalendarDays()}
            </View>
          )}
          
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>
              Lịch hẹn ngày {selectedDate.getDate()}/{jsToApiMonth(selectedDate.getMonth())}/{selectedDate.getFullYear()}
            </Text>
            
            {locationId && vendorData && (
              <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.locationText}>
                  Địa điểm: {vendorData.locations[0].address}, {vendorData.locations[0].district}
                </Text>
              </View>
            )}
            
            <ScrollView style={styles.appointmentsList}>
              {getAppointmentsForDate().length > 0 ? (
                getAppointmentsForDate().map(booking => {
                  const dateString = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
                  const timeSlot = getTimeSlot(dateString);
                  
                  return (
                    <TouchableOpacity 
                      key={booking.id} 
                      style={styles.appointmentCard}
                      onPress={() => handleBookingPress(booking)}
                    >
                      <View style={styles.appointmentTimeContainer}>
                        <Text style={styles.appointmentTime}>{timeSlot || "N/A"}</Text>
                        <View style={[
                          styles.statusIndicator, 
                          { backgroundColor: getStatusColor(booking.status) }
                        ]} />
                      </View>
                      <View style={styles.appointmentDetails}>
                        <Text style={styles.clientName}>{booking.fullName}</Text>
                        <Text style={styles.serviceText}>{booking.service}</Text>
                        {booking.notes && (
                          <Text style={styles.notesText}>Ghi chú: {booking.notes}</Text>
                        )}
                        <Text style={styles.contactText}>
                          <Ionicons name="call-outline" size={12} color={theme.colors.lightText} /> {booking.phone}
                        </Text>
                        <View style={styles.bookingFooter}>
                          <View style={styles.statusContainer}>
                            <Text style={styles.statusText}>{booking.status}</Text>
                          </View>
                          <Text style={styles.priceText}>{formatCurrency(booking.total)}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.noAppointments}>
                  <Ionicons name="calendar-outline" size={40} color="#ccc" />
                  <Text style={styles.noAppointmentsText}>Không có lịch hẹn</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginBottom: 60,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  vendorName: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.lightText,
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
  },
  dayOfWeekText: {
    fontSize: 14,
    color: theme.colors.lightText,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  dayCell: {
    width: (width - 20) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  selectedDayCell: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todayText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    bottom: 5,
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    marginTop: 10,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.lightText,
    marginLeft: 5,
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentTimeContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    marginRight: 15,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  appointmentDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  serviceText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 13,
    color: theme.colors.lightText,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  contactText: {
    fontSize: 13,
    color: theme.colors.lightText,
    marginBottom: 5,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.lightText,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  noAppointments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noAppointmentsText: {
    marginTop: 10,
    color: '#ccc',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarLoadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  calendarErrorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.lightText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#FFC107',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingId: {
    fontSize: 14,
    color: theme.colors.lightText,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 20,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  customerInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  modalContactText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingDetailItem: {
    flex: 1,
  },
  bookingDetailLabel: {
    fontSize: 14,
    color: theme.colors.lightText,
    marginBottom: 5,
  },
  bookingDetailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  bookingDetailText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  notesLabel: {
    fontSize: 14,
    color: theme.colors.lightText,
    marginBottom: 5,
  },
  paymentInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 14,
    color: theme.colors.lightText,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  paidAmount: {
    color: '#4CAF50',
  },
  remainingAmount: {
    color: theme.colors.lightText,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  closeButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  halfWidthButton: {
    flex: 1,
  }
});

export default ScheduleScreen; 