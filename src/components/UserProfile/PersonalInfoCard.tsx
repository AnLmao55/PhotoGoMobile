import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface PersonalInfoCardProps {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    onEdit?: () => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
    fullName,
    phone,
    email,
    address,
    onEdit,
}) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Thông tin cá nhân</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Họ và tên</Text>
                <Text style={styles.value}>{fullName}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.row}>
                <Text style={styles.label}>Số điện thoại</Text>
                <Text style={styles.value}>{phone}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{email}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.row}>
                <Text style={styles.label}>Địa chỉ</Text>
                <Text style={styles.value}>{address}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={onEdit}>
                <Text style={styles.buttonText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        margin: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    label: {
        color: '#666',
        fontSize: 14,
        flex: 1,
    },
    value: {
        color: '#000',
        fontSize: 14,
        flex: 1,
        textAlign: 'right',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },
    button: {
        backgroundColor: '#F8B26A',
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default PersonalInfoCard;
