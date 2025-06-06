import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Voucher {
    id: string;
    code: string;
    discount: string;
    expiry: string;
    description: string;
    backgroundColor: string;
    icon?: string;
}

const vouchers: Voucher[] = [
    {
        id: '1',
        code: 'SUMMER25',
        discount: 'Giảm 25%',
        expiry: '30/06/2025',
        description: 'Giảm 25% cho mọi gói dịch vụ trong mùa hè.',
        backgroundColor: '#FF6B6B',
        icon: 'sunny',
    },
    {
        id: '2',
        code: 'NEWUSER10',
        discount: 'Giảm 10%',
        expiry: '31/12/2025',
        description: 'Dành cho người dùng mới.',
        backgroundColor: '#3EC1C9',
    },
    // Add more vouchers as needed
];

const VoucherCard: React.FC<{ voucher: Voucher }> = ({ voucher }) => {
    const handleCopy = () => {
        Clipboard.setString(voucher.code);
    };

    return (
        <View style={[styles.card, { backgroundColor: voucher.backgroundColor }]}>
            <View style={styles.header}>
                <Text style={styles.label}>Mã voucher</Text>
                {voucher.icon && <Ionicons name={voucher.icon as any} size={24} color="#FFD93D" />}
            </View>

            <View style={styles.codeRow}>
                <Text style={styles.code}>{voucher.code}</Text>
                <TouchableOpacity onPress={handleCopy}>
                    <Ionicons name="copy-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.discountRow}>
                <View style={styles.discountTag}>
                    <Text style={styles.discountText}>{voucher.discount}</Text>
                </View>
                <Text style={styles.expiry}>HSD: {voucher.expiry}</Text>
            </View>

            <Text style={styles.description}>{voucher.description}</Text>
        </View>
    );
};

const VoucherList: React.FC = () => {
    return (
        <View style={styles.background}>
            <View style={styles.container}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Voucher của bạn</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={vouchers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <VoucherCard voucher={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            </View>
        </View>
    );
};

const { width } = Dimensions.get('window');
const cardWidth = width * 0.8;

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
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAll: {
        fontSize: 14,
        color: '#FF6B6B',
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    card: {
        width: cardWidth,
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: 'white',
        fontSize: 14,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    code: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        marginRight: 8,
    },
    discountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    discountTag: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    discountText: {
        color: 'white',
        fontSize: 14,
    },
    expiry: {
        color: 'white',
        fontSize: 12,
    },
    description: {
        color: 'white',
        fontSize: 14,
        marginTop: 12,
    },
});

export default VoucherList;
