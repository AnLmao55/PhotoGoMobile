import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import SearchBar from '../components/SearchBar';
import Services from '../components/Services';


const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <SearchBar />
      
      <Services />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    paddingTop: 50,
  },

});

export default HomeScreen;