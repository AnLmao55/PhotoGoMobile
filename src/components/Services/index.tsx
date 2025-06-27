import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { theme } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/service-packages/filter`;

const Services = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const params = new URLSearchParams({
                    status: 'hoạt động',
                    current: '1',
                    pageSize: '5',
                });
                const response = await fetch(`${API_URL}?${params}`);
                const json = await response.json();
                setServices(json?.data?.data || []);
            } catch (error) {
                setServices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Các dịch vụ của chúng tôi</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AllServices')}>
                    <Text style={styles.viewAll}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
                </View>
            ) : (
                <FlatList
                    data={services}
                    renderItem={({ item }) => (
                        <View key={item.id} style={styles.card}>
                            <Image
                                source={{ uri: item.image || 'https://via.placeholder.com/120x120' }}
                                style={styles.image}
                            />
                            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.price}>
                                {item.minPrice === item.maxPrice
                                    ? `${item.minPrice.toLocaleString()}₫`
                                    : `${item.minPrice.toLocaleString()}₫ - ${item.maxPrice.toLocaleString()}₫`}
                            </Text>
                            {/* Có thể thêm các trường khác nếu muốn */}
                            {/* <TouchableOpacity style={styles.favoriteIcon}>
                                <Ionicons name="heart-outline" size={24} color={theme.colors.text} />
                            </TouchableOpacity> */}
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    contentContainerStyle={styles.horizontalListContent}
                    showsHorizontalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: theme.spacing.sm,
        
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
        fontSize: theme.fontSizes.lg,
        fontWeight: '700',
        color: theme.colors.text,
    },
    viewAll: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.primary,
    },
    listContent: {
        paddingHorizontal: theme.spacing.md,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: 180,
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        marginRight: theme.spacing.md,
        padding: theme.spacing.sm,
        elevation: 3,
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        position: 'relative',
        alignItems: 'flex-start',
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: theme.spacing.sm,
        backgroundColor: '#f0f0f0',
    },
    name: {
        fontSize: theme.fontSizes.md,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    price: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.primary,
        fontWeight: '600',
        marginTop: 2,
        marginBottom: theme.spacing.xs,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    horizontalListContent: {
        paddingHorizontal: theme.spacing.md,
    },
    // favoriteIcon: {
    //     position: 'absolute',
    //     top: theme.spacing.sm,
    //     right: theme.spacing.sm,
    //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
    //     borderRadius: 20,
    //     padding: 4,
    // },
});
export default Services;