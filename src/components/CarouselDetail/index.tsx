import React, { useRef, useState } from 'react';
import {
    View,
    FlatList,
    Image,
    Dimensions,
    TouchableOpacity,
    Text,
    StyleSheet,
    NativeScrollEvent,
    NativeSyntheticEvent
} from 'react-native';

const { width } = Dimensions.get('window');

interface CarouselItem {
    id: string;
    uri: string | null;
}

const images: CarouselItem[] = [
    { id: '1', uri: null },
    { id: '2', uri: null },
    { id: '3', uri: null },
];

type Props = {
    studio: any;
};
const Carousel: React.FC<Props> = ({ studio }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const flatListRef = useRef<FlatList<CarouselItem>>(null);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const goToSlide = (index: number) => {
        if (index >= 0 && index < images.length) {
            flatListRef.current?.scrollToIndex({ index });
        }
    };

    const renderItem = ({ item }: { item: CarouselItem }) => (
        <View style={styles.slide}>
            {item.uri ? (
                <Image source={{ uri: item.uri }} style={styles.image} />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderIcon}>🖼</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={images}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            />




            {/* Heart icon */}
            <View style={styles.heart}>
                <Text style={styles.heartText}>♡</Text>
            </View>

            {/* Indicators */}
            <View style={styles.indicatorContainer}>
                {images.map((_, i) => (
                    <View key={i} style={[styles.dot, currentIndex === i && styles.activeDot]} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    slide: {
        width,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
    },
    image: {
        width: 250,
        height: 250,
        resizeMode: 'cover',
    },
    placeholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 28,
        color: '#888',
    },
    leftArrow: {
        position: 'absolute',
        top: '45%',
        left: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 5,
        elevation: 2,
    },
    rightArrow: {
        position: 'absolute',
        top: '45%',
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 5,
        elevation: 2,
    },
    arrowText: {
        fontSize: 28,
        color: '#444',
    },
    heart: {
        position: 'absolute',
        top: 30,
        right: 10,
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20, // half of width/height
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },

    heartText: {
        fontSize: 20,
        color: '#444',
    },
    indicatorContainer: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        flexDirection: 'row',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#444',
    },
});

export default Carousel;
