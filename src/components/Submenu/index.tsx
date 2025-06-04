import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface SubmenuItem {
  id: string;
  label: string;
  icon: string;
}

interface SubmenuProps {
  items?: SubmenuItem[];
  onItemPress?: (item: SubmenuItem) => void;
}

const defaultItems: SubmenuItem[] = [
  { id: '1', label: 'Giảm giá', icon: 'pricetag' },
  { id: '2', label: 'Trò chơi', icon: 'game-controller' },
  { id: '3', label: 'Quay thưởng', icon: 'aperture-outline' },
  { id: '4', label: 'Flash Sale', icon: 'flash' },
  { id: '5', label: 'Ưu đãi', icon: 'gift' },
  { id: '6', label: 'Mới', icon: 'star' },
  
];

const Submenu: React.FC<SubmenuProps> = ({ items = defaultItems, onItemPress }) => {
  const navigation = useNavigation();

  const handlePress = (item: SubmenuItem) => {
    if (item.id === '3') { // Quay thưởng item
      navigation.navigate('SpinPrize');
    }
    if (onItemPress) {
      onItemPress(item);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => handlePress(item)}
          >
            <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm-15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightText,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  item: {
    width: 60, // Fixed width for each item
    alignItems: 'center',
    marginRight: theme.spacing.lg, // Consistent gap between items
    paddingBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.sm / 2,
    textAlign: 'center',
  },
});


export default Submenu;