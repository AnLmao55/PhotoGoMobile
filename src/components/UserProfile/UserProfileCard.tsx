import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

interface UserProfileCardProps {
    name: string;
    email: string;
    isVIP?: boolean;
    avatarUrl?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ name, email, isVIP = false, avatarUrl }) => {
    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder} />
                )}
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.email}>{email}</Text>
                {isVIP && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Khách hàng VIP</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const AVATAR_SIZE = 50;

const styles = StyleSheet.create({
    container: {
        paddingTop: theme.spacing.md * 2,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 8,
    },
    avatarContainer: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 2,
        borderColor: '#F4CBA1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatar: {
        width: AVATAR_SIZE - 4,
        height: AVATAR_SIZE - 4,
        borderRadius: (AVATAR_SIZE - 4) / 2,
    },
    avatarPlaceholder: {
        width: AVATAR_SIZE - 4,
        height: AVATAR_SIZE - 4,
        borderRadius: (AVATAR_SIZE - 4) / 2,
        backgroundColor: '#eee',
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
    badge: {
        marginTop: 4,
        alignSelf: 'flex-start',
        backgroundColor: '#FCEADB',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        color: '#F4A361',
        fontWeight: '600',
    },
});

export default UserProfileCard;
