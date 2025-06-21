import React from 'react'
import { SafeAreaView, View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native'
import UserProfileCard from '../components/UserProfile/UserProfileCard'
import PersonalInfoCard from '../components/UserProfile/PersonalInfoCard'
import LoyaltyCard from '../components/UserProfile/LoyaltyCard'

function UserProfileScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <UserProfileCard
                        name="Nguyễn Thành"
                        email="nguyenthanh@example.com"
                        isVIP={true}
                    />
                    <PersonalInfoCard
                        fullName="PhotoGo"
                        phone="0912 345 678"
                        email="nguyenthanh@example.com"
                        address="123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh"
                        onEdit={() => console.log('Edit pressed')}
                    />
                    <LoyaltyCard
                        currentLevel="VIP"
                        currentPoints={750}
                        totalPoints={1000}
                        nextLevelPoints={250}
                        onSeeMore={() => console.log('Xem thêm ưu đãi')}
                    />
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.button} >
                            <Text style={styles.buttonText}>Xem thêm ưu đãi</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

            </View>
        </SafeAreaView>


    )
}
const styles = StyleSheet.create({
    card: {
        padding: 16,
        margin: 16,
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
    scrollContent: {
        paddingBottom: 100, // leave space for sticky button
    },
    button: {
        borderColor: 'black',
        borderWidth: 1.2,
        borderRadius: 24,
        paddingVertical: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontWeight: '600',
    },
})

export default UserProfileScreen

