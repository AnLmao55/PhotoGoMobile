import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image // ✅ You need to import this
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
type Props = {
    studio: any;
};

type ServiceType = {
    id: string;
    name: string;


    image?: string;
};

const ServiceItem: React.FC<{ service: ServiceType }> = ({ service }) => {
    const navigation = useNavigation();
    const handlePress = () => {
        navigation.navigate("Booking", { selectedService: service });
    };
    return (
        <TouchableOpacity onPress={handlePress} style={styles.serviceCard}>
            <View style={styles.serviceImage}>
                {service.image ? (
                    <Image source={{ uri: service.image }} style={styles.imageStyle} />
                ) : (
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                )}
            </View>
            <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                {/* <Text style={styles.servicePrice}>{service.price}đ</Text> */}
                {/* {service.duration && (
                    <View style={styles.serviceDurationRow}>
                        <Ionicons name="time-outline" size={16} color="#999" />
                        <Text style={styles.serviceDuration}>{service.duration}</Text>
                    </View>
                )} */}
            </View>
        </TouchableOpacity>
    );
};

const ServiceList: React.FC<Props> = ({ studio }) => {
    return (
        <View style={styles.background}>
            <View style={styles.container}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Gói dịch vụ</Text>
                </View>
                {Array.isArray(studio.servicePackages) &&
                    studio.servicePackages.map((service: ServiceType) => (
                        <ServiceItem key={service.id} service={service} />
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
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    serviceCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        marginHorizontal: 16,
        marginBottom: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        elevation: 3,
    },
    serviceImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#EAEAEA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    imageStyle: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    servicePrice: {
        color: '#FF7F50',
        fontSize: 16,
        fontWeight: 'bold',
    },
    serviceDurationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    serviceDuration: {
        fontSize: 12,
        color: '#999',
        marginLeft: 4,
    },
});

export default ServiceList;
