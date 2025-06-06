// VoucherModal.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Dimensions
} from 'react-native';
import Modal from 'react-native-modal';

const { height } = Dimensions.get('window');

interface VoucherModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const vouchers = [
    { id: '1', code: 'SUMMER25', discount: '25%', desc: 'Giảm 25% cho mọi gói dịch vụ trong mùa hè.', expiry: '30/06/2025', bgColor: '#FF6B6B' },
    { id: '2', code: 'NEWUSER10', discount: '10%', desc: 'Dành cho khách hàng mới.', expiry: '31/12/2025', bgColor: '#34D1BF' },
];

const VoucherModal: React.FC<VoucherModalProps> = ({ isVisible, onClose }) => {
    const renderItem = ({ item }: { item: typeof vouchers[0] }) => (
        <View style={[styles.voucherCard, { backgroundColor: item.bgColor }]}>
            <Text style={styles.code}>Mã voucher</Text>
            <Text style={styles.codeValue}>{item.code}</Text>
            <Text style={styles.discount}>Giảm {item.discount}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
            <Text style={styles.expiry}>HSD: {item.expiry}</Text>
        </View>
    );

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            swipeDirection="down"
            onSwipeComplete={onClose}
            style={styles.modal}
            backdropOpacity={0.3}
            propagateSwipe
        >
            <View style={styles.modalContent}>
                <Text style={styles.title}>Tất cả voucher</Text>

                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="Nhập mã PhotoGo voucher" />
                    <TouchableOpacity style={styles.applyButton}>
                        <Text style={styles.applyText}>Áp dụng</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={vouchers}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: { justifyContent: 'flex-end', margin: 0 },
    modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height * 0.8 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    inputWrapper: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, height: 40 },
    applyButton: { marginLeft: 10, backgroundColor: '#ddd', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
    applyText: { fontWeight: 'bold' },
    voucherCard: { borderRadius: 15, padding: 15, marginBottom: 15 },
    code: { color: '#fff', fontWeight: '500', marginBottom: 5 },
    codeValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    discount: { color: '#fff', fontWeight: 'bold', marginVertical: 5 },
    desc: { color: '#fff', marginBottom: 10 },
    expiry: { color: '#fff', fontSize: 12 },
});

export default VoucherModal;
