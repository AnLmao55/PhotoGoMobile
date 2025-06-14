import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

const IntroductionSection: React.FC = () => {
    const [expanded, setExpanded] = useState(false);

    const fullText =
        'Ánh Dương Studio là studio chụp ảnh chuyên nghiệp hàng đầu tại TP. Hồ Chí Minh với hơn 10 năm kinh nghiệm. Chúng tôi cung cấp dịch vụ chụp ảnh cưới, gia đình, sự kiện và nhiều hơn nữa.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standar ';

    return (
        <View style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Giới thiệu</Text>
                <Text
                    style={styles.description}
                    numberOfLines={expanded ? undefined : 2}
                >
                    {fullText}
                </Text>
                <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                    <Text style={styles.toggleText}>
                        {expanded ? 'Thu gọn' : 'Xem thêm'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: "#fff",
    },
    container: {

        marginHorizontal: 16,
        marginTop: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    toggleText: {
        marginTop: 4,
        fontSize: 14,
        color: '#fb923c',
        fontWeight: '500',
    },
});

export default IntroductionSection;
