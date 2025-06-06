import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Assume your ReviewList component is imported here
import ReviewList from '../ReviewItem';

const ScreenWithStickyButton: React.FC = () => {
    return (
        <View style={styles.container}>


            <View style={styles.stickyButtonContainer}>
                <TouchableOpacity style={styles.stickyButton}>
                    <Ionicons name="calendar-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.stickyButtonText}>Đặt lịch ngay</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 80, // give enough space so content won't be blocked by button
    },
    stickyButtonContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
    },
    stickyButton: {
        backgroundColor: '#F7A55B',
        borderRadius: 999,
        height: 48,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        elevation: 5,
    },
    stickyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ScreenWithStickyButton;
