import React from 'react';
import { FlatList, StyleSheet, ViewStyle } from 'react-native';
import ConceptItem from './ConceptItem';

const ConceptList = ({
    concepts,
    selectedId,
    onSelect,
}: {
    concepts: any[];
    selectedId: string;
    onSelect: (item: any) => void;
}) => (
    <FlatList
        data={concepts}
        horizontal
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
            <ConceptItem
                concept={item}
                isSelected={item.id === selectedId}
                onPress={() => onSelect(item)}
            />
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
    />
);

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        marginBottom: 16,
    },
});

export default ConceptList;
