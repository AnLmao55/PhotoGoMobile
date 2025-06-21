import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressBar } from 'react-native-paper';

interface LoyaltyCardProps {
    currentLevel: string;
    currentPoints: number;
    totalPoints: number;
    nextLevelPoints: number;
    onSeeMore?: () => void;
}

const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
    currentLevel,
    currentPoints,
    totalPoints,
    nextLevelPoints,
    onSeeMore,
}) => {
    const progress = currentPoints / totalPoints;

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Chương trình khách hàng thân thiết</Text>

            <Text style={styles.level}>
                Cấp độ hiện tại: <Text style={styles.bold}>{currentLevel}</Text> {'  '}
                <Text>{`${currentPoints}/${totalPoints} điểm`}</Text>
            </Text>

            <ProgressBar progress={progress} color="#F8B26A" style={styles.progressBar} />

            <View style={styles.upgradeBox}>
                <Text style={styles.upgradeText}>
                    Còn {nextLevelPoints} điểm nữa để lên hạng
                    <Text style={styles.upgradeLevel}> Platinum</Text>
                </Text>
            </View>

            <View style={styles.benefitSection}>
                <Text style={styles.benefitTitle}>Ưu đãi hiện tại:</Text>
                <Text style={styles.benefit}>• Giảm 10% cho mỗi lần đặt lịch</Text>
                <Text style={styles.benefit}>• Ưu tiên đặt lịch với nhiếp ảnh gia nổi tiếng</Text>
                <Text style={styles.benefit}>• Tặng 1 album ảnh miễn phí mỗi năm</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={onSeeMore}>
                <Text style={styles.buttonText}>Xem thêm ưu đãi</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        margin: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    title: {
        fontWeight: '700',
        fontSize: 15,
        marginBottom: 12,
    },
    level: {
        fontSize: 14,
        marginBottom: 4,
        color: '#333',
    },
    bold: {
        fontWeight: '700',
    },
    progressBar: {
        height: 8,
        borderRadius: 10,
        backgroundColor: '#E4E4E4',
        marginVertical: 8,
    },
    upgradeBox: {
        backgroundColor: '#FCEADB',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    upgradeText: {
        fontSize: 13,
        color: '#F4A361',
    },
    upgradeLevel: {
        fontWeight: '600',
    },
    benefitSection: {
        marginBottom: 16,
    },
    benefitTitle: {
        fontWeight: '600',
        marginBottom: 6,
    },
    benefit: {
        fontSize: 14,
        marginVertical: 2,
        color: '#333',
    },
    button: {
        borderColor: 'black',
        borderWidth: 1.2,
        borderRadius: 24,
        paddingVertical: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontWeight: '600',
    },
});

export default LoyaltyCard;
