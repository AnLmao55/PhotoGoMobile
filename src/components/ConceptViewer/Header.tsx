import React from 'react';
import { Text, StyleSheet } from 'react-native';

const Header = () => (
    <Text style={styles.header}>Xem Concept - Chụp ảnh cá nhân Beauty</Text>
);

const styles = StyleSheet.create({
    header: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
});

export default Header;
