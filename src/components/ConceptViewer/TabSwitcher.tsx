import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TabSwitcher = ({
    activeTab,
    setActiveTab,
}: {
    activeTab: 'image' | 'detail';
    setActiveTab: (tab: 'image' | 'detail') => void;
}) => (
    <View style={styles.tabRow}>
        <TouchableOpacity onPress={() => setActiveTab('image')}>
            <Text style={[styles.tab, activeTab === 'image' && styles.activeTab]}>Hình ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('detail')}>
            <Text style={[styles.tab, activeTab === 'detail' && styles.activeTab]}>Chi tiết</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    tabRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    tab: {
        marginRight: 16,
        fontSize: 14,
        color: '#888',
        paddingBottom: 4,
    },
    activeTab: {
        color: '#fb923c',
        borderBottomWidth: 2,
        borderBottomColor: '#fb923c',
    },
});

export default TabSwitcher;
