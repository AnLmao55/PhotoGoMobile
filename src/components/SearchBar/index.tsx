import React from 'react';
import { TextInput, StyleSheet, View, Image, Text } from 'react-native';
import { theme } from '../../theme/theme';

const logo = require('../../../assets/favicon.png');

const SearchBar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={logo}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.location}>Deliver to New York 10150</Text>
      </View>
      <TextInput
        style={styles.search}
        placeholder="🔍 Bạn đang tìm gì?"
        placeholderTextColor={theme.colors.lightText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: theme.spacing.sm,
  },
  location: {
    flex: 1,
    textAlign: 'right',
    color: theme.colors.text,
    fontSize: 14,
  },
  search: {
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.lightText,
    borderRadius: 40,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: '#E6F0FA',
    width: '100%',
    marginTop: 10,
  },
});

export default SearchBar;