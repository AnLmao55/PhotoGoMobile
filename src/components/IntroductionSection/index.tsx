import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
type Props = {
    studio: any;
};
const IntroductionSection: React.FC<Props> = ({ studio }) => {
    const [expanded, setExpanded] = useState(false);
    const { width } = useWindowDimensions();

    return (
        <View style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Giới thiệu</Text>
                {/* <Text
                    style={styles.description}
                    numberOfLines={expanded ? undefined : 2}
                >
                    {studio.description}
                </Text> */}
                <RenderHtml
                    contentWidth={width}
                    source={{ html: studio.description || '' }}
                    tagsStyles={{
                        body: expanded ? {} : { maxHeight: 80, overflow: 'hidden' },
                    }}
                />

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
