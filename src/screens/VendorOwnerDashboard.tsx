import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import TabNavigatorVendor from '../navigation/TabNavigatorVendor';

const VendorOwnerDashboard: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <TabNavigatorVendor />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default VendorOwnerDashboard; 