import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
  Alert,
  useWindowDimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import RenderHTML from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';

interface VendorProfile {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  status: string;
  user_id: {
    id: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    role: {
      id: string;
      name: string;
      description: string;
    };
  };
  category: {
    id: string;
    name: string;
  };
  locations: Array<{
    id: string;
    address: string;
    district: string;
    ward: string;
    city: string;
  }>;
  servicePackages: Array<any>;
  totalPrice: number;
  averageRating: number;
}

const ProfileScreen: React.FC = () => {
  // States for toggle switches
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('basic');

  // States for profile data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Navigation
  const navigation = useNavigation();

  // Get window dimensions for RenderHTML
  const { width } = useWindowDimensions();

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.photogo.id.vn/api/v1';

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('No user data found');
      }

      const parsedUserData = JSON.parse(userDataString);
      setUserData(parsedUserData);
      
      const userId = parsedUserData.id;
      const accessToken = await AsyncStorage.getItem('access_token');

      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Make API request
      const response = await axios.get(
        `${API_URL}/vendors/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update state with the response data
      setVendorProfile(response.data.data);
    } catch (err: any) {
      console.error('Error fetching vendor profile:', err);
      setError(err.message || 'Failed to fetch vendor profile');
      Alert.alert('Error', 'Failed to fetch vendor profile data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract full address
  const getFullAddress = () => {
    if (!vendorProfile || !vendorProfile.locations || vendorProfile.locations.length === 0) {
      return "No address available";
    }
    
    const location = vendorProfile.locations[0];
    return `${location.address}, ${location.ward}, ${location.district}, ${location.city}`;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Show confirmation alert
      Alert.alert(
        "Đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất?",
        [
          { text: "Hủy", style: "cancel" },
          { 
            text: "Đăng xuất", 
            onPress: async () => {
              // Clear user data from AsyncStorage
              await AsyncStorage.multiRemove(['userData', 'access_token', 'refresh_token']);
              
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
            },
            style: "destructive"
          }
        ]
      );
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="red" />
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchVendorProfile}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: vendorProfile?.logo || 'https://placekitten.com/200/200' }}
          style={styles.profileImage}
        />
        <View style={styles.headerContent}>
          <Text style={styles.studioName}>{vendorProfile?.name || 'Studio Name'}</Text>
          
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      

      {/* Profile Information */}
      <View style={styles.infoContainer}>
        {/* Email */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>
            {userData?.email || vendorProfile?.user_id?.email || 'Loading...'}
          </Text>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Địa chỉ</Text>
          <Text style={styles.infoValue}>{getFullAddress()}</Text>
        </View>

        {/* Phone */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số điện thoại</Text>
          <Text style={styles.infoValue}>
            {userData?.phoneNumber || vendorProfile?.user_id?.phoneNumber || 'Loading...'}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trạng thái</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: vendorProfile?.status === 'hoạt động' ? '#4CAF50' : '#FFC107' }]} />
            <Text style={[styles.statusText, { color: vendorProfile?.status === 'hoạt động' ? '#4CAF50' : '#FFC107' }]}>
              {vendorProfile?.status === 'hoạt động' ? 'Hoạt Động' : vendorProfile?.status || 'Loading...'}
            </Text>
          </View>
        </View>

        {/* Category */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Danh mục</Text>
          <Text style={styles.infoValue}>{vendorProfile?.category?.name || 'Loading...'}</Text>
        </View>

        {/* Rating */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Đánh giá trung bình</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingValue}>{vendorProfile?.averageRating || '0.0'}</Text>
            <Ionicons name="star" size={18} color="#FFC107" />
          </View>
        </View>

        {/* Description */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mô tả</Text>
          {vendorProfile?.description ? (
            <RenderHTML 
              contentWidth={width - 60}
              source={{ html: vendorProfile.description }}
              tagsStyles={{
                p: { fontSize: 16, color: '#333', marginBottom: 8 },
                strong: { fontWeight: 'bold' }
              }}
            />
          ) : (
            <Text style={styles.infoValue}>Không có thông tin mô tả</Text>
          )}
        </View>

        {/* Service Price */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Giá dịch vụ</Text>
          <Text style={styles.infoValue}>
            {vendorProfile?.servicePackages && vendorProfile.servicePackages.length > 0 
              ? `${vendorProfile.servicePackages[0].serviceConcepts[0].price.toLocaleString()} đ - ${vendorProfile.totalPrice.toLocaleString()} đ`
              : 'Không có thông tin giá'}
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: theme.colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  studioName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  completionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  completionBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionProgress: {
    height: '100%',
    backgroundColor: '#FF9800',
  },
  completionPercentage: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  editButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 5,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 5,
  },
  settingsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 5,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 30,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
    maxWidth: '90%',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen; 