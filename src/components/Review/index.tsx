import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import axios from 'axios';

interface User {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface Vendor {
  id: string;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
}

interface Booking {
  id: string;
}

interface ReviewItem {
  id: string;
  comment: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  booking: Booking;
  images: string[];
  vendor: Vendor;
}

interface ReviewResponse {
  statusCode: number;
  message: string;
  data: {
    data: ReviewItem[];
    pagination: {
      current: number;
      pageSize: number;
      totalPage: number;
      totalItem: number;
    }
  }
}

const Review: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 4,
    totalPage: 1,
    totalItem: 0
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ReviewResponse>(
        `${process.env.EXPO_PUBLIC_API_URL}/reviews?current=${pagination.current}&pageSize=${pagination.pageSize}&sortBy=created_at&sortDirection=desc`
      );
      
      if (response.data.statusCode === 200) {
        const reviewData = response.data.data;
        setReviews(reviewData.data);
        setPagination(reviewData.pagination);
      } else {
        setError('Lỗi khi lấy dữ liệu đánh giá');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={18}
          color={'#F4B400'} // Google-like star color
          style={styles.star}
        />
      );
    }
    return stars;
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const renderReviewItem = ({ item }: { item: ReviewItem }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarContainer}>
            {item.user.avatarUrl ? (
              <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>{getInitials(item.user.fullName)}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerText}>
            <Text style={styles.name}>{item.user.fullName}</Text>
            <View style={styles.starContainer}>{renderStars(item.rating)}</View>
          </View>
        </View>
        
        <Text style={styles.reviewText}>"{item.comment}"</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary || '#F7A55B'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReviews}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>ĐÁNH GIÁ GẦN ĐÂY</Text>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        horizontal={false}
      />
      
      {pagination.totalPage > 1 && pagination.current < pagination.totalPage && (
        <TouchableOpacity 
          style={styles.loadMoreButton}
          onPress={() => {
            setPagination(prev => ({...prev, current: prev.current + 1}));
            fetchReviews();
          }}
        >
          <Text style={styles.loadMoreText}>Xem thêm đánh giá</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl+30,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    color: '#FF6B6B',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 12,
    color: '#999',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary || '#F7A55B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text || '#202124',
    marginBottom: theme.spacing.lg,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContent: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  initialsAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#009688',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    fontStyle: 'normal',
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  star: {
    marginRight: 2,
  },
  loadMoreButton: {
    backgroundColor: '#F0F0F0',
    padding: theme.spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  loadMoreText: {
    color: theme.colors.primary || '#F7A55B',
    fontWeight: '600',
  },
});

export default Review;