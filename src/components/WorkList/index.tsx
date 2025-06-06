import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const works = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },

];

const WorkItem: React.FC = () => {
    return (
        <View style={styles.workItem}>
            <Ionicons name="image" size={40} color="#ccc" />
        </View>
    );
};

const WorkList: React.FC = () => {
    return (
        <View style={styles.background}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Tác phẩm</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.gridContainer}>
                    {works.map((item) => (
                        <WorkItem key={item.id} />
                    ))}
                </View>
            </View>
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
        justifyContent: 'space-between', // ONLY CHANGE THIS
    },
    workItem: {
        width: itemSize,
        height: itemSize,
        backgroundColor: '#EAEAEA',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginRight: 16, // ADD MARGIN RIGHT for spacing
    },
});

export default WorkList;
