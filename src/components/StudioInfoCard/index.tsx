import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const StudioInfoCard: React.FC = () => {
    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Ánh Dương Studio</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Mở cửa</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.rating}>4.8</Text>
                <Text style={styles.ratingCount}>(128)</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.location}>Quận 1, TP. Hồ Chí Minh</Text>
            </View>

            <View style={styles.tagContainer}>
                {['Chụp ảnh cưới', 'Chụp ảnh gia đình', 'Chụp ảnh sự kiện'].map((tag, index) => (
                    <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    statusBadge: {
        backgroundColor: '#d4f5dd',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    statusText: {
        color: '#0f9d58',
        fontWeight: '600',
        fontSize: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    star: {
        fontSize: 14,
        color: '#fbbc04',
    },
    rating: {
        marginLeft: 4,
        fontWeight: 'bold',
        fontSize: 13,
        color: '#444',
    },
    ratingCount: {
        marginLeft: 4,
        fontSize: 13,
        color: '#888',
    },
    dot: {
        marginHorizontal: 6,
        fontSize: 12,
        color: '#888',
    },
    location: {
        fontSize: 13,
        color: '#555',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    tag: {
        backgroundColor: '#f1f3f4',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#333',
    },
});

export default StudioInfoCard;
