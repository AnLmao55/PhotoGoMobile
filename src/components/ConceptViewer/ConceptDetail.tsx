import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ConceptDetail = ({ concept }: { concept: any }) => (
    <View style={styles.detailBox}>
        <Text>Thông tin chi tiết về concept "{concept.name}" sẽ hiển thị ở đây.</Text>
    </View>
);

const styles = StyleSheet.create({
    detailBox: {
        padding: 16,
        backgroundColor: '#f1f5f9',
        margin: 16,
        borderRadius: 8,
    },
});

export default ConceptDetail;
