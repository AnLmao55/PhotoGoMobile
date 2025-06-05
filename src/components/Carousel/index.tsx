import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { theme } from '../../theme/theme';

interface CarouselItem {
  id: number;
  image: string;
  title: string;
}

interface CarouselProps {
  data: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH - 2 * theme.spacing.md; // Account for HomeScreen padding

const Carousel: React.FC<CarouselProps> = ({
  data,
  autoPlay = true,
  interval = 3000
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoPlay) {
      timer = setInterval(() => {
        const nextIndex = activeIndex === data.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
        scrollViewRef.current?.scrollTo({
          x: ITEM_WIDTH * nextIndex,
          animated: true
        });
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, interval);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeIndex, autoPlay, data.length, interval, fadeAnim]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / ITEM_WIDTH);
    setActiveIndex(index);
  };

  const handleBookNow = () => {
    console.log('Book Now clicked for item:', data[activeIndex].title);
  };

  return (
    <View style={styles.container}>
      <View style={styles.premiumBadge}>
        <Text style={styles.premiumBadgeText}>Premium</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollViewContent}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
      >
        {data.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[styles.slide, { opacity: fadeAnim }]}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={handleBookNow}
              >
                <Text style={styles.bookButtonText}>Đặt ngay</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
            onPress={() => {
              setActiveIndex(index);
              scrollViewRef.current?.scrollTo({
                x: ITEM_WIDTH * index,
                animated: true
              });
            }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: 220,
    marginVertical: theme.spacing.md,
  },
  scrollViewContent: {
    paddingHorizontal: theme.spacing.md, // Match HomeScreen padding
  },
  slide: {
    width: ITEM_WIDTH,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    elevation: 5,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,

  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: theme.spacing.md,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: theme.colors.background,
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 8,
  },
  bookButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: theme.spacing.lg + 3,
    alignSelf: 'center',
    zIndex: 2,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: theme.colors.lightText,
    marginHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.background,
  },
  paginationDotActive: {
    backgroundColor: theme.colors.primary,
    transform: [{ scale: 1.2 }],
  },
  premiumBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
    zIndex: 1,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    marginLeft: theme.spacing.sm,
  },
  premiumBadgeText: {

    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
  },
});

export default Carousel;