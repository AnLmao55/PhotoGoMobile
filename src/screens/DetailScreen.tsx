import React from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Carousel from '../components/CarouselDetail';
import StudioInfoCard from '../components/StudioInfoCard';
import VoucherCard from '../components/VoucherCard';
import IntroductionSection from '../components/IntroductionSection';

import VoucherList from '../components/VoucherCard2';
import ServiceList from '../components/ServiceLIst';
import WorkList from '../components/WorkList';
import ReviewList from '../components/ReviewItem';
import ScreenWithStickyButton from '../components/ScreenWithStickyButton';

const DetailScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Carousel />
                    <StudioInfoCard />
                    <VoucherCard />
                    <IntroductionSection />
                    <VoucherList />
                    <ServiceList />
                    <WorkList />
                    <ReviewList />
                </ScrollView>

                <View style={styles.stickyButtonContainer}>
                    <TouchableOpacity style={styles.stickyButton}>
                        <Ionicons name="calendar-outline" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.stickyButtonText}>Đặt lịch ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
    stickyButtonContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
    },
    stickyButton: {
        backgroundColor: '#F7A55B',
        borderRadius: 999,
        height: 50,
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

export default DetailScreen;
