import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

interface DeliveryItem {
  id: string;
  image: string;
  name: string;
  description: string;
  rating: number;
  reviewImage?: string; // Added review image field
}

const deliveryData: DeliveryItem[] = [
  {
    id: '1',
    image: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
    name: 'Khách 1',
    description: 'Đặt chụp ảnh cưới, tỉ mỉ, chuẩn bị đầy đủ và đẹp mong đợi',
    rating: 5,
    reviewImage: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
  },
  {
    id: '2',
    image: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
    name: 'Khách 2',
    description: 'Tội đặt lần 2 luôn, quay lại lần sau',
    rating: 4,
    reviewImage: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
  },
  {
    id: '3',
    image: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
    name: 'Khách 3',
    description: 'Đặt chụp tâm linh và hơi nhu cầu',
    rating: 3,
    reviewImage: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
  },
];

const Review: React.FC = () => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={18}
          color={theme.colors.star || '#F4B400'} // Updated to Google-like star color
          style={styles.star}
        />
      );
    }
    return stars;
  };

  const renderItem = ({ item }: { item: DeliveryItem }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.headerContainer}>
          <Image source={{ uri: item.image }} style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.starContainer}>{renderStars(item.rating)}</View>
          </View>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        {item.reviewImage && (
          <Image source={{ uri: item.reviewImage }} style={styles.reviewImage} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>ĐÁNH GIÁ GẦN ĐÂY</Text>
      <FlatList
        data={deliveryData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E8ECEF', // Subtle border
    elevation: 3,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '400',
    color: theme.colors.text || '#202124',
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.lightText || '#5F6368',
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  starContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 4,
  },
  reviewImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginTop: theme.spacing.sm,
    resizeMode: 'cover',
  },
});

export default Review;