import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface LoyaltyCardProps {
    currentLevel: string;
    currentPoints: number;
    totalPoints: number;
    nextLevelPoints: number;
    onSeeMore?: () => void;
}

interface RankConfig {
    gradientColors: string[];
    cardStyle: object;
    textColor: string;
    iconName: any; // Using any for Ionicons name
    progressColor: string;
}

const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
    currentLevel,
    currentPoints,
    totalPoints,
    nextLevelPoints,
    onSeeMore,
}) => {
    const progress = currentPoints / totalPoints;
    
    // Configuration for each rank level
    const rankConfigs: {[key: string]: RankConfig} = {
        'Đồng': {
            gradientColors: ['#CD7F32', '#E3A95E', '#CD7F32'],
            cardStyle: styles.bronzeCard,
            textColor: '#FFFFFF',
            iconName: 'shield-outline',
            progressColor: '#CD7F32'
        },
        'Bạc': {
            gradientColors: ['#C0C0C0', '#E8E8E8', '#C0C0C0'],
            cardStyle: styles.silverCard,
            textColor: '#555555',
            iconName: 'shield-half-outline',
            progressColor: '#A9A9A9'
        },
        'Vàng': {
            gradientColors: ['#FFD700', '#FFF3A0', '#FFD700'],
            cardStyle: styles.goldCard,
            textColor: '#705E00',
            iconName: 'shield',
            progressColor: '#F8B26A'
        },
        'Kim Cương': {
            gradientColors: ['#B9F2FF', '#44C3E8', '#00A3E0'],
            cardStyle: styles.diamondCard,
            textColor: '#FFFFFF',
            iconName: 'diamond-outline',
            progressColor: '#00A3E0'
        }
    };

    // Get the configuration for the current level, default to bronze if not found
    const rankConfig = rankConfigs[currentLevel] || rankConfigs['Đồng'];
    
    // Determine next level name based on current level
    const getNextLevelName = () => {
        switch (currentLevel) {
            case 'Đồng': return 'Bạc';
            case 'Bạc': return 'Vàng';
            case 'Vàng': return 'Kim Cương';
            default: return 'Kim Cương';
        }
    };

    const nextLevelName = getNextLevelName();

    return (
        <LinearGradient 
            colors={rankConfig.gradientColors as any}
            style={[styles.card, rankConfig.cardStyle]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.cardContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: rankConfig.textColor }]}>
                        Chương trình khách hàng thân thiết
                    </Text>
                    <Ionicons name={rankConfig.iconName} size={24} color={rankConfig.textColor} />
                </View>

                <View style={styles.levelContainer}>
                    <Text style={[styles.levelLabel, { color: rankConfig.textColor }]}>
                        Cấp độ hiện tại:
                    </Text>
                    <Text style={[styles.levelValue, { color: rankConfig.textColor }]}>
                        {currentLevel}
                    </Text>
                </View>
{/* 
                <Text style={[styles.points, { color: rankConfig.textColor }]}>
                    {`${currentPoints}/${totalPoints} điểm`}
                </Text>

                <ProgressBar 
                    progress={progress} 
                    color={rankConfig.progressColor} 
                    style={styles.progressBar} 
                /> */}

                <View style={[styles.upgradeBox, { backgroundColor: `${rankConfig.textColor}15` }]}>
                    <Text style={[styles.upgradeText, { color: rankConfig.textColor }]}>
                        {/* Còn {nextLevelPoints} điểm nữa để lên hạng */}
                        
                        <Text style={styles.upgradeLevel}> {nextLevelName}</Text>
                    </Text>
                </View>

                <View style={styles.benefitSection}>
                    <Text style={[styles.benefitTitle, { color: rankConfig.textColor }]}>Ưu đãi hiện tại:</Text>
                    {/* <Text style={[styles.benefit, { color: rankConfig.textColor }]}>• Giảm 10% cho mỗi lần đặt lịch</Text>
                    <Text style={[styles.benefit, { color: rankConfig.textColor }]}>• Ưu tiên đặt lịch với nhiếp ảnh gia nổi tiếng</Text>
                    <Text style={[styles.benefit, { color: rankConfig.textColor }]}>• Tặng 1 album ảnh miễn phí mỗi năm</Text> */}
                </View>

                {/* <TouchableOpacity 
                    style={[styles.button, { borderColor: rankConfig.textColor }]} 
                    onPress={onSeeMore}
                >
                    <Text style={[styles.buttonText, { color: rankConfig.textColor }]}>Xem thêm ưu đãi</Text>
                </TouchableOpacity> */}
            </View>
        </LinearGradient>
    );
};


const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        margin: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    bronzeCard: {
        borderWidth: 0.5,
        borderColor: '#CD7F32',
    },
    silverCard: {
        borderWidth: 0.5,
        borderColor: '#C0C0C0',
    },
    goldCard: {
        borderWidth: 0.5,
        borderColor: '#FFD700',
    },
    diamondCard: {
        borderWidth: 0.5,
        borderColor: '#00A3E0',
    },
    cardContent: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontWeight: '700',
        fontSize: 16,
        
    },
    levelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    levelLabel: {
        fontSize: 14,
    },
    levelValue: {
        fontSize: 16,
        fontWeight: '800',
        marginLeft: 8,
    },
    points: {
        fontSize: 14,
        marginBottom: 4,
    },
    progressBar: {
        height: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginVertical: 8,
    },
    upgradeBox: {
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },
    upgradeText: {
        fontSize: 13,
    },
    upgradeLevel: {
        fontWeight: '600',
    },
    benefitSection: {
        marginBottom: 16,
    },
    benefitTitle: {
        fontWeight: '600',
        marginBottom: 10,
    },
    benefit: {
        fontSize: 14,
        marginVertical: 4,
    },
    button: {
        borderWidth: 1.2,
        borderRadius: 24,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    buttonText: {
        fontWeight: '600',
    },
});

export default LoyaltyCard;
