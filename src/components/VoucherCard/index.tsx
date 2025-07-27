import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';

interface VoucherCardProps {
    id: string;
    code: string;
    discount: string;
    description: string;
    minSpend: number;
    validUntil: string;
    onPress: () => void;
    onClaim: (id: string) => void;
    isLoading?: boolean;
    isOwned?: boolean;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
    id,
    code,
    discount,
    description,
    minSpend,
    validUntil,
    onPress,
    onClaim,
    isLoading = false,
    isOwned = false,
}) => {
    // Format the date to a more readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Remove HTML tags from description
    const stripHtml = (html: string) => {
        if (!html) return '';
        return html.replace(/<\/?[^>]+(>|$)/g, '');
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.topSection}>
                <View style={styles.leftColumn}>
                    <Text style={styles.discountText}>{discount}</Text>
                    <Text style={styles.description}>{stripHtml(description)}</Text>
                </View>
                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Mã</Text>
                    <Text style={styles.code}>{code}</Text>
                </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.bottomSection}>
                <Text style={styles.condition}>
                    Đơn tối thiểu: {minSpend ? minSpend.toLocaleString('vi-VN') : 0} VNĐ
                </Text>
                <Text style={styles.expiry}>
                    HSD: {formatDate(validUntil)}
                </Text>
            </View>
            
            <View style={styles.claimSection}>
                {isOwned ? (
                    <View style={styles.ownedBadge}>
                        <Text style={styles.ownedText}>Đã nhận</Text>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.claimButton}
                        onPress={() => onClaim(id)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.claimText}>Nhận ngay</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    leftColumn: {
        flex: 1,
        paddingRight: 16,
    },
    discountText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f6ac69',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#2D3748',
        lineHeight: 20,
    },
    codeContainer: {
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
    },
    codeLabel: {
        fontSize: 12,
        color: '#A0AEC0',
        marginBottom: 2,
    },
    code: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 8,
    },
    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    condition: {
        fontSize: 12,
        color: '#A0AEC0',
    },
    expiry: {
        fontSize: 12,
        color: '#A0AEC0',
    },
    claimSection: {
        marginTop: 12,
        alignItems: 'center',
    },
    claimButton: {
        backgroundColor: '#f6ac69',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    claimText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    ownedBadge: {
        backgroundColor: '#E2E8F0',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    ownedText: {
        color: '#4A5568',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default VoucherCard;
