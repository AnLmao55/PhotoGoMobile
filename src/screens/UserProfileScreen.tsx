import React from 'react'
import { SafeAreaView, View, StyleSheet } from 'react-native'
import UserProfileCard from '../components/UserProfile/UserProfileCard'

function UserProfileScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <UserProfileCard
                    name="Nguyễn Thành"
                    email="nguyenthanh@example.com"
                    isVIP={true}
                />

            </View>
        </SafeAreaView>


    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
})

export default UserProfileScreen

