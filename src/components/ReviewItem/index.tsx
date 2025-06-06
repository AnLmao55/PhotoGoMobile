import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const reviews = [
    {
        id: '1',
        name: 'Nguyễn Minh Anh',
        rating: 5,
        content: 'Dịch vụ rất chuyên nghiệp, ảnh đẹp hơn mong đợi!',
    },
];

const ReviewItem: React.FC<{ review: typeof reviews[0] }> = ({ review }) => {
    return (
        <View style={styles.reviewCard}>
            <View style={styles.headerRow}>
                <View style={styles.avatar}>
                    <Ionicons name="person-circle-outline" size={40} color="#ccc" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{review.name}</Text>
                    <View style={styles.ratingRow}>
                        {Array.from({ length: review.rating }).map((_, index) => (
                            <Ionicons key={index} name="star" size={14} color="#FFD700" />
                        ))}
                    </View>
                </View>
            </View>
            <Text style={styles.content}>{review.content}</Text>
        </View>
    );
};

const ReviewList: React.FC = () => {
    return (
        <View style={styles.background}>
            <View style={styles.container}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Đánh giá</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>
                {reviews.map(review => (
                    <ReviewItem key={review.id} review={review} />
                ))}
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
    title: {
        fontSize: 20,
        fontWeight: '700',
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
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    ratingRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    content: {
        fontSize: 14,
        color: '#333',
    },
});

export default ReviewList;
