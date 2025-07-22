import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const DashboardScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý hồ sơ</Text>
        <Text style={styles.welcomeText}>Xin chào, Studio Aloha</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Đơn hàng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Lịch hẹn hôm nay</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>Đánh giá</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
      
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>Đơn hàng #{item}00{item}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item === 1 ? '#FFC107' : '#4CAF50' }]}>
              <Text style={styles.statusText}>{item === 1 ? 'Đang xử lý' : 'Hoàn thành'}</Text>
            </View>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Khách hàng: </Text>
            <Text style={styles.orderValue}>Nguyễn Văn A</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Ngày hẹn: </Text>
            <Text style={styles.orderValue}>2{item}/07/2025</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Giá trị: </Text>
            <Text style={styles.orderValue}>{1 + item}50.000 đ</Text>
          </View>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <Text style={styles.sectionTitle}>Thống kê doanh thu</Text>
      <View style={styles.chartPlaceholder}>
        <Ionicons name="stats-chart" size={40} color={theme.colors.primary} />
        <Text style={styles.chartText}>Biểu đồ doanh thu</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginBottom: 100,
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
    marginBottom: 10,
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: -30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '31%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    marginTop: 5,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  orderLabel: {
    color: '#666',
    width: 100,
  },
  orderValue: {
    fontWeight: '500',
  },
  viewButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  viewButtonText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  chartPlaceholder: {
    backgroundColor: 'white',
    height: 200,
    margin: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chartText: {
    marginTop: 10,
    color: '#666',
  },
});

export default DashboardScreen; 