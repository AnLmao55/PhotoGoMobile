import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface ReviewUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface ReviewVendor {
  id: string;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  status: string;
}

interface Review {
  id: string;
  comment: string;
  rating: number;
  createdAt: string;
  user: ReviewUser;
  vendor: ReviewVendor;
  images: string[];
}

interface ReviewResponse {
  data: Review[];
  pagination: {
    current: number;
    pageSize: number;
    totalPage: number;
    totalItem: number;
  };
  averageRating: number;
}

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          {review.user.avatarUrl ? (
            <Image 
              source={{ uri: review.user.avatarUrl }} 
              style={styles.avatarImage} 
            />
          ) : (
            <Ionicons name="person-circle-outline" size={40} color="#ccc" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{review.user.fullName}</Text>
          <View style={styles.ratingRow}>
            {Array.from({ length: review.rating }).map((_, index) => (
              <Ionicons key={index} name="star" size={14} color="#FFD700" />
            ))}
            {Array.from({ length: 5 - review.rating }).map((_, index) => (
              <Ionicons key={index + review.rating} name="star-outline" size={14} color="#FFD700" />
            ))}
            <Text style={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.content}>{review.comment}</Text>
      
      {review.images && review.images.length > 0 && (
        <View style={styles.imageContainer}>
          {review.images.map((image, index) => (
            <Image 
              key={index} 
              source={{ uri: image }} 
              style={styles.reviewImage} 
            />
          ))}
        </View>
      )}
    </View>
  );
};

interface ReviewListProps {
  studio?: any;
}

const ReviewList: React.FC<ReviewListProps> = ({ studio }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,  // Changed from 10 to 5 to show more pages for testing pagination
    totalPage: 0,
    totalItem: 0
  });

  useEffect(() => {
    if (studio?.id) {
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, [studio?.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching reviews for studio ${studio?.id}, page ${pagination.current}`);
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/reviews/vendor/${studio?.id}?current=${pagination.current}&pageSize=${pagination.pageSize}`
      );
      
      // Log the full response structure to debug
      console.log('Full API response:', JSON.stringify(response.data, null, 2));
      
      // The response structure is: response.data -> data -> data (array of reviews)
      const reviewData = response.data.data;
      const reviewArray = reviewData.data || [];
      
      console.log(`Received ${reviewArray.length} reviews. Total: ${reviewData.pagination.totalItem}`);
      
      // Append new reviews to existing ones when loading more pages
      setReviews(prev => {
        const newReviews = pagination.current > 1 
          ? [...prev, ...reviewArray] 
          : reviewArray;
        console.log(`Updated reviews array, now has ${newReviews.length} items`);
        return newReviews;
      });
      
      setPagination(reviewData.pagination);
      setAverageRating(reviewData.averageRating || 0);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Không thể tải đánh giá");
      setLoading(false);
    }
  };

  const loadMoreReviews = () => {
    if (!loading && pagination.current < pagination.totalPage) {
      // First update the page number, then fetch in the next render cycle using useEffect
      setPagination(prev => ({...prev, current: prev.current + 1}));
    }
  };

  // Use effect to watch for pagination changes and fetch reviews
  useEffect(() => {
    if (studio?.id && pagination.current > 1) {
      fetchReviews();
    }
  }, [pagination.current]);

  if (loading) {
    return (
      <View style={[styles.background, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#F7A55B" />
      </View>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <View style={[styles.background, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReviews}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Đánh giá</Text>
            {averageRating > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{averageRating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          
          {pagination.totalItem > reviews.length && (
            <TouchableOpacity onPress={loadMoreReviews} style={styles.viewAllButton}>
              <Text style={styles.viewAll}>Xem thêm ({pagination.totalItem - reviews.length} đánh giá khác)</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {reviews.length === 0 ? (
          <View style={styles.noReviews}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ccc" />
            <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
          </View>
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ReviewItem review={item} />}
            scrollEnabled={false}
            ListFooterComponent={
              loading && pagination.current > 1 ? (
                <View style={styles.loadMoreIndicator}>
                  <ActivityIndicator size="small" color="#F7A55B" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#fff",
  },
  container: {
    paddingVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  viewAll: {
    fontSize: 14,
    color: '#FF7F50',
  },
  reviewCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  content: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#F7A55B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noReviews: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noReviewsText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginLeft: 4,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  viewAllButton: {
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loadMoreIndicator: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default ReviewList;
