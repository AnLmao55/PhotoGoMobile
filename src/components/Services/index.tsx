import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

// Dummy data for services
const services = [
    { id: '1', title: 'Ảnh Cưới', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy8d0cdHGh9VKu8jipd3_MOvvit2dHlFIaow&s' },
    { id: '2', title: 'Chân dung', image: 'https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp' },
    { id: '3', title: 'Sự kiện', image: 'https://juro.com.vn/wp-content/uploads/cach-chup-anh-su-kien.jpg' },
    { id: '4', title: 'Sản phẩm', image: 'https://images.squarespace-cdn.com/content/v1/53883795e4b016c956b8d243/1671853906962-RV08WWNIS1LTNE453MOX/Artboard%2B2.jpg?format=750w' },
];

const Services = () => {
    return (
        <>
            
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Các dịch vụ của chúng tôi</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAll}>Tất cả</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.services}>
                {services.map((service) => (
                    <TouchableOpacity key={service.id} style={styles.serviceCard}>
                        <Image source={{ uri: service.image }} style={styles.serviceImage} />
                        <Text style={styles.serviceText}>{service.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
        fontSize: theme.fontSizes.md,
        color: theme.colors.text,
        fontWeight: 'bold',
    },
    viewAll: {
        color: theme.colors.primary,
        fontSize: theme.fontSizes.sm,
    },
    services: {
        marginBottom: theme.spacing.lg,
    },
    serviceCard: {
        marginRight: theme.spacing.md,
        alignItems: 'center',
    },
    serviceImage: {
        width: 80,
        height: 80,
        borderRadius: 20,
    },
    serviceText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: theme.fontSizes.sm,
        marginTop: theme.spacing.sm,
    },
});

export default Services;