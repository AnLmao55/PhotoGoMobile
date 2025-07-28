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
    NativeSyntheticEvent,
    ImageBackground
} from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
    studio: any;
};

const Carousel: React.FC<Props> = ({ studio }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    // Use the actual banner and logo from the studio object
    const bannerImage = studio?.banner || null;
    const logoImage = studio?.logo || null;

    return (
        <View style={styles.container}>
            <View style={styles.slide}>
                {bannerImage ? (
                    <ImageBackground 
                        source={{ uri: bannerImage }} 
                        style={styles.banner}
                        imageStyle={{ opacity: 0.9 }}
                    >
                        <View style={styles.logoContainer}>
                            {logoImage ? (
                                <Image source={{ uri: logoImage }} style={styles.logo} />
                            ) : (
                                <View style={styles.placeholderLogo}>
                                    <Text style={styles.placeholderIcon}>
                                        {studio?.name?.charAt(0) || '?'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.studioNameContainer}>
                            <Text style={styles.studioName}>{studio?.name || 'Studio'}</Text>
                        </View>
                    </ImageBackground>
                ) : (
                    <View style={styles.placeholder}>
                        <View style={styles.logoContainer}>
                            {logoImage ? (
                                <Image source={{ uri: logoImage }} style={styles.logo} />
                            ) : (
                                <View style={styles.placeholderLogo}>
                                    <Text style={styles.placeholderIcon}>
                                        {studio?.name?.charAt(0) || '?'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.studioNameContainer}>
                            <Text style={styles.studioName}>{studio?.name || 'Studio'}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Heart icon */}
            <View style={styles.heart}>
                <Text style={styles.heartText}>♡</Text>
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
    banner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'cover',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        resizeMode: 'cover',
        borderWidth: 3,
        borderColor: 'white',
    },
    studioNameContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 16,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    studioName: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderLogo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F7A55B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    placeholderIcon: {
        fontSize: 50,
        color: 'white',
        fontWeight: 'bold',
    },
    heart: {
        position: 'absolute',
        top: 30,
        right: 10,
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    heartText: {
        fontSize: 20,
        color: '#444',
    },
});

export default Carousel;
