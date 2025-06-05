import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

const VoucherCard: React.FC = () => {
    return (
        <View style={styles.background}>
            <View style={styles.card}>
                <View style={styles.leftColumn}>
                    <Text style={styles.title}>🎉 Ưu đãi đặc biệt</Text>
                    <Text style={styles.subtitle}>Có 4 voucher đang chờ bạn</Text>
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>Giảm đến 30%</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>Xem tất cả →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: '#fff',
    },
    card: {
        borderRadius: 16,
        padding: 16,
        margin: 16,
        backgroundColor: '#f66b6b', // flat gradient-ish coral
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    leftColumn: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    subtitle: {
        color: '#fff',
        marginTop: 4,
        fontSize: 13,
    },
    discountBadge: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    discountText: {
        color: '#f66b6b',
        fontWeight: 'bold',
        fontSize: 12,
    },
    viewAllButton: {
        marginLeft: 16,
    },
    viewAllText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
});

export default VoucherCard;
