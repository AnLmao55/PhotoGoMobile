import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { theme } from '../theme/theme'; // Import theme

const { width, height } = Dimensions.get('window');
const wheelSize = width * 0.8;
const radius = wheelSize / 2;

interface Prize {
  id: string;
  name: string;
  image: string;
  probability: number;
  color: string;
}

const prizes: Prize[] = [
  {
    id: '1',
    name: 'iPhone 15',
    image: '📱',
    probability: 0.01,
    color: theme.colors.primary,
  },
  {
    id: '2',
    name: '100K VND',
    image: '💰',
    probability: 0.05,
    color: theme.colors.secondary,
  },
  {
    id: '3',
    name: 'Voucher 50K',
    image: '🎫',
    probability: 0.15,
    color: '#45B7D1', // No direct theme match
  },
  {
    id: '4',
    name: 'Chúc may mắn lần sau',
    image: '🍀',
    probability: 0.37,
    color: '#96CEB4', // No direct theme match
  },
  {
    id: '5',
    name: 'Voucher 20K',
    image: '🎁',
    probability: 0.2,
    color: '#FFEAA7', // No direct theme match
  },
  {
    id: '6',
    name: '1 lần thử lại',
    image: '🔄',
    probability: 0.22,
    color: '#DDA0DD', // No direct theme match
  },
];

const SpinPrizeGame: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  const anglePerSection = 360 / prizes.length;

  const selectPrizeByProbability = (): Prize => {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize;
      }
    }
    return prizes[prizes.length - 1];
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedPrize(null);

    const selectedPrize = selectPrizeByProbability();
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const targetAngle = prizeIndex * anglePerSection;
    const spins = 5;
    const finalAngle = 420 * spins + (360 - targetAngle) + (anglePerSection / 2);

    spinValue.setValue(0);

    Animated.timing(spinValue, {
      toValue: finalAngle,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      setSelectedPrize(selectedPrize);

      // Kiểm tra chỉ số phần thưởng dựa trên góc cuối cùng
      const normalizedAngle = finalAngle % 360; // Chuẩn hóa góc về 0-360
      const calculatedPrizeIndex = Math.floor(normalizedAngle / anglePerSection);
      const calculatedPrize = prizes[calculatedPrizeIndex];

      // console.log('Selected Prize:', selectedPrize.name);
      // console.log('Calculated Prize from angle:', calculatedPrize.name);

      // if (calculatedPrize.id !== selectedPrize.id) {
      //   console.warn('Prize mismatch! Expected:', selectedPrize.name, 'but got:', calculatedPrize.name);
      // }

      // Hiển thị kết quả
      setTimeout(() => {
        Alert.alert(
          'Chúc mừng! 🎉',
          `Bạn đã trúng: ${selectedPrize.name}`,
          [{ text: 'OK', onPress: () => { } }]
        );
      }, 500);
    });
  };

  const createWheelPath = (index: number): string => {
    const startAngle = (index * anglePerSection - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * anglePerSection - 90) * (Math.PI / 180);

    const x1 = radius + radius * 0.9 * Math.cos(startAngle);
    const y1 = radius + radius * 0.9 * Math.sin(startAngle);
    const x2 = radius + radius * 0.9 * Math.cos(endAngle);
    const y2 = radius + radius * 0.9 * Math.sin(endAngle);

    const largeArcFlag = anglePerSection > 180 ? 1 : 0;

    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius * 0.9} ${radius * 0.9} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (index: number) => {
    const angle = (index * anglePerSection + anglePerSection / 2 - 90) * (Math.PI / 180);
    const textRadius = radius * 0.7;
    const x = radius + textRadius * Math.cos(angle);
    const y = radius + textRadius * Math.sin(angle);
    return { x, y };
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.background]}
        style={styles.background}
      >
        <Text style={styles.title}>🎰 VÒNG QUAY MAY MẮN</Text>

        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Svg width={wheelSize} height={wheelSize}>
              {prizes.map((prize, index) => (
                <React.Fragment key={prize.id}>
                  <Path
                    d={createWheelPath(index)}
                    fill={prize.color}
                    stroke={theme.colors.background}
                    strokeWidth="1"
                  />
                  <SvgText
                    x={getTextPosition(index).x}
                    y={getTextPosition(index).y + 10}
                    fontSize={theme.fontSizes.lg+5}
                    textAnchor="middle"
                    fill={theme.colors.text}
                    fontWeight="bold"
                  >
                    {prize.image}
                  </SvgText>
                  <SvgText
                    x={getTextPosition(index).x}
                    y={getTextPosition(index).y + 15}
                    fontSize={theme.fontSizes.sm}
                    textAnchor="middle"
                    fill={theme.colors.text}
                    fontWeight="bold"
                  >
                    {/* {prize.name} */}
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>
          </Animated.View>

          <View style={styles.pointer}>
            <Text style={styles.pointerText}>▼</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
          onPress={spinWheel}
          disabled={isSpinning}
        >
          <LinearGradient
            colors={isSpinning ? [theme.colors.lightText, '#999'] : [theme.colors.primary, theme.colors.background]}
            style={styles.spinButtonGradient}
          >
            <Text style={styles.spinButtonText}>
              {isSpinning ? 'ĐANG QUAY...' : 'QUAY NGAY'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* {selectedPrize && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              🎉 Bạn đã trúng: {selectedPrize.name} {selectedPrize.image}
            </Text>
          </View>
        )} */}

        
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  wheelContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  wheel: {
    width: wheelSize,
    height: wheelSize,
    borderRadius: wheelSize / 2,
    backgroundColor: theme.colors.background,
    elevation: 10,
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  pointer: {
    position: 'absolute',
    top: -10,
    zIndex: 10,
  },
  pointerText: {
    fontSize: 40,
    color: theme.colors.primary,
    textShadowColor: theme.colors.text,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  spinButton: {
    marginBottom: theme.spacing.lg,
  },
  spinButtonGradient: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.md,
    elevation: 5,
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: theme.colors.background + 'E6',
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  resultText: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  probabilityContainer: {
    backgroundColor: theme.colors.secondary + '33',
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    width: width * 0.9,
  },
  probabilityTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  probabilityItem: {
    marginVertical: theme.spacing.xs,
  },
  probabilityText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    textAlign: 'center',
  },
});

export default SpinPrizeGame;