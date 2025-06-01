import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface ArtistItem {
  id: string;
  image: string;
  name: string;
}

const artistsData: ArtistItem[] = [
  { id: '1', image: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D', name: 'Trần Thị 1' },
  { id: '2', image: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D', name: 'Trần Thị 2' },
];

const MakeupArtists: React.FC = () => {
  const renderItem = ({ item }: { item: ArtistItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.role}>ST tại Hồ Chí Minh</Text>
      <TouchableOpacity style={styles.favoriteIcon}>
        <Ionicons name="heart-outline" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>NGƯỜI TRANG ĐIỂM</Text>
      <FlatList
        data={artistsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
  },
  card: {
    width: 150,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
    elevation: 3,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
  },
  name: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  role: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.lightText,
    textAlign: 'center',
  },
  favoriteIcon: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
});

export default MakeupArtists;