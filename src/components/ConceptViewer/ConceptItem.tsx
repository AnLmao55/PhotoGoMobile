import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ConceptItem = ({
    concept,
    isSelected,
    onPress,
}: {
    concept: any;
    isSelected: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={onPress}
    >
        <Image source={{ uri: concept.image }} style={styles.image} />
        <Text style={styles.name}>{concept.name}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    item: {
        marginRight: 12,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 6,
        backgroundColor: '#f9f9f9',
        width: 90,
        height: 90,
    },
    selectedItem: {
        borderColor: '#fb923c',
        backgroundColor: '#fff7ed',
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: 6,
        marginBottom: 2,

    },
    name: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        maxWidth: 64,
    },
});

export default ConceptItem;
