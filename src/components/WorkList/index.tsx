import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    Modal,
    Pressable
} from 'react-native';

const WorkList: React.FC<{ studio: any }> = ({ studio }) => {
    const [showAll, setShowAll] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const allImages = useMemo(() => {
        if (!studio?.servicePackages) return [];
        return studio.servicePackages.flatMap(pkg =>
            pkg.serviceConcepts?.flatMap(concept => concept.images || [])
        );
    }, [studio]);

    const imagesToShow = showAll ? allImages : allImages.slice(0, 6);

    const handleImagePress = (uri: string) => {
        setSelectedImage(uri);
        setPreviewVisible(true);
    };

    return (
        <View style={styles.background}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Tác phẩm</Text>
                    {allImages.length > 6 && !showAll && (
                        <TouchableOpacity onPress={() => setShowAll(true)}>
                            <Text style={styles.viewAll}>Xem tất cả</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.gridContainer}>
                    {imagesToShow.map((url, index) => (
                        <TouchableOpacity key={index} onPress={() => handleImagePress(url)}>
                            <View style={styles.workItem}>
                                <Image source={{ uri: url }} style={styles.image} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Image Preview Modal */}
            <Modal visible={previewVisible} transparent={true}>
                <Pressable style={styles.modalBackground} onPress={() => setPreviewVisible(false)}>
                    <Image source={{ uri: selectedImage ?? '' }} style={styles.fullImage} />
                </Pressable>
            </Modal>
        </View>
    );
};

const itemSize = (Dimensions.get('window').width - 64 - 16 * 2) / 3;

const styles = StyleSheet.create({
    background: {
        backgroundColor: "#fff",
    },
    container: {
        paddingVertical: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    viewAll: {
        fontSize: 14,
        color: '#FF7F50',
    },
    gridContainer: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    workItem: {
        width: itemSize,
        height: itemSize,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#EEE',
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '90%',
        height: '70%',
        resizeMode: 'contain',
        borderRadius: 12,
    },
});

export default WorkList;