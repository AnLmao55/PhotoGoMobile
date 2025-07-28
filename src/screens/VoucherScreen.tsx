import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { voucherService, Voucher, UserVoucher } from '../services/voucherService';
import VoucherCard from '../components/VoucherCard';

interface UserData {
  id: string;
  email: string;
  fullName?: string;
  // Thêm các trường khác nếu cần
}

type TabType = 'all' | 'my';

const VoucherScreen = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingVoucher, setClaimingVoucher] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [loadingUserVouchers, setLoadingUserVouchers] = useState(false);

  const fetchUserData = async () => {
    try {
      // Lấy access token để kiểm tra đăng nhập
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.log('Không tìm thấy access token');
        return null;
      }
      
      const userDataString = await AsyncStorage.getItem('userData');
      console.log('UserData from AsyncStorage:', userDataString);
      
      if (userDataString) {
        const userData: UserData = JSON.parse(userDataString);
        console.log('Parsed userData:', userData);
        
        if (userData && userData.id) {
          console.log('User ID found:', userData.id);
          setUserId(userData.id);
          return userData.id;
        } else {
          console.log('User ID không hợp lệ hoặc không tồn tại');
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const fetchVouchers = async (page: number) => {
    try {
      setLoading(true);
      const response = await voucherService.getVouchers(page);
      console.log('Vouchers data structure:', JSON.stringify(response.data).substring(0, 200));
      setVouchers(response.data.data);
      setTotalPages(response.data.pagination.totalPage);
      setError(null);
    } catch (err) {
      setError('Failed to fetch vouchers');
      console.error('Error fetching vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVouchers = async (userId: string) => {
    if (!userId || userId === 'unknown') {
      console.log('User ID không hợp lệ, không thể lấy voucher');
      setLoadingUserVouchers(false);
      return;
    }
    
    try {
      setLoadingUserVouchers(true);
      console.log('Fetching vouchers for user ID:', userId);
      const response = await voucherService.getUserVouchers(userId);
      console.log('User vouchers response structure:', JSON.stringify(response.data).substring(0, 200));
      setUserVouchers(response.data.data);
    } catch (err) {
      console.error('Error fetching user vouchers:', err);
      Alert.alert("Lỗi", "Không thể tải voucher của bạn. Vui lòng thử lại sau.");
    } finally {
      setLoadingUserVouchers(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchVouchers(currentPage);
      const uid = await fetchUserData();
      if (uid) {
        await fetchUserVouchers(uid);
      }
    };
    
    initialize();
  }, [currentPage]);

  const handleClaimVoucher = async (voucherId: string) => {
    if (!userId || userId === 'unknown') {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để nhận mã giảm giá");
      return;
    }

    try {
      setClaimingVoucher(voucherId);
      
      // Check if user already has this voucher
      const hasVoucher = userVouchers.some(uv => uv.voucherId === voucherId);
      if (hasVoucher) {
        Alert.alert("Thông báo", "Bạn đã nhận mã giảm giá này rồi");
        setClaimingVoucher(null);
        return;
      }

      console.log('Claiming voucher with ID:', voucherId, 'for user:', userId);
      const response = await voucherService.claimVoucher(userId, voucherId);
      console.log('Claim voucher response:', response);
      
      // Update user vouchers list
      if (response && response.data) {
        setUserVouchers(prevVouchers => [...prevVouchers, response.data]);
        Alert.alert("Thành công", "Đã nhận mã giảm giá thành công");
      } else {
        Alert.alert("Thông báo", "Đã xử lý yêu cầu nhận voucher");
      }
    } catch (error: any) {
      console.error('Error claiming voucher:', error);
      let errorMessage = "Không thể nhận mã giảm giá. Vui lòng thử lại sau.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ') 
          : error.response.data.message;
      }
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setClaimingVoucher(null);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const isVoucherOwned = (voucherId: string) => {
    return userVouchers.some(uv => uv.voucherId === voucherId);
  };

  const renderVoucherItem = ({ item }: { item: Voucher }) => {
    const owned = isVoucherOwned(item.id);
    return (
      <VoucherCard
        id={item.id}
        code={item.code}
        discount={`${item.discount_value}${item.discount_type === 'phần trăm' ? '%' : ' VND'}`}
        description={item.description}
        minSpend={item.minPrice}
        validUntil={item.end_date}
        onPress={() => {}}
        onClaim={handleClaimVoucher}
        isLoading={claimingVoucher === item.id}
        isOwned={owned}
      />
    );
  };

  const renderUserVoucherItem = ({ item }: { item: UserVoucher }) => {
    const voucher = item.voucher;
    return (
      <VoucherCard
        id={voucher.id}
        code={voucher.code}
        discount={`${voucher.discount_value}${voucher.discount_type === 'phần trăm' ? '%' : ' VND'}`}
        description={voucher.description}
        minSpend={voucher.minPrice}
        validUntil={voucher.end_date}
        onPress={() => {}}
        onClaim={() => {}}
        isOwned={true}
      />
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'all') {
      if (loading && vouchers.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#f6ac69" />
          </View>
        );
      }

      if (error && vouchers.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchVouchers(currentPage)}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <>
          <FlatList
            data={vouchers}
            renderItem={renderVoucherItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text>Không có mã giảm giá nào</Text>
              </View>
            }
          />
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
                onPress={handlePrevPage}
                disabled={currentPage === 1}
              >
                <Text style={styles.pageButtonText}>Prev</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                {currentPage} / {totalPages}
              </Text>
              <TouchableOpacity
                style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
                onPress={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    } else {
      // My Vouchers tab
      if (loadingUserVouchers) {
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#f6ac69" />
          </View>
        );
      }

      if (!userId) {
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Vui lòng đăng nhập để xem voucher của bạn</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={userVouchers}
          renderItem={renderUserVoucherItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text>Bạn chưa có voucher nào</Text>
              <TouchableOpacity 
                style={[styles.retryButton, { marginTop: 16 }]}
                onPress={() => setActiveTab('all')}
              >
                <Text style={styles.retryText}>Nhận voucher ngay</Text>
              </TouchableOpacity>
            </View>
          }
          refreshing={loadingUserVouchers}
          onRefresh={() => userId && fetchUserVouchers(userId)}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Mã giảm giá</Text> */}
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
            Của tôi
          </Text>
        </TouchableOpacity>
      </View>
      
      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fdfcff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2D3748',
  },
  listContent: {
    paddingBottom: 24,
  },
  errorText: {
    color: '#E53E3E',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f6ac69',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f6ac69',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
  },
  pageButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pageInfo: {
    marginHorizontal: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f6ac69',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#f6ac69',
  },
  tabText: {
    fontWeight: '600',
    color: '#f6ac69',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

export default VoucherScreen; 