import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the RootStackParamList type to fix the navigation typing issue
type RootStackParamList = {
  SpinPrize: undefined;
  VoucherScreen: undefined;
  // Add other screens as needed
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SubmenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap; // Fix the icon type to match Ionicons
}

interface SubmenuProps {
  items?: SubmenuItem[];
  onItemPress?: (item: SubmenuItem) => void;
}

const defaultItems: SubmenuItem[] = [
  { id: '1', label: 'Giảm giá', icon: 'pricetag' },
  // { id: '2', label: 'Trò chơi', icon: 'game-controller' },
  { id: '2', label: 'Quay thưởng', icon: 'aperture-outline' },
  // { id: '4', label: 'Flash Sale', icon: 'flash' },
  { id: '3', label: 'Điểm tích lũy', icon: 'gift' },
  // { id: '6', label: 'Mới', icon: 'star' },
  
];

const Submenu: React.FC<SubmenuProps> = ({ items = defaultItems, onItemPress }) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = (item: SubmenuItem) => {
    if (item.id === '2') { // Quay thưởng item
      navigation.navigate('SpinPrize');
    } else if (item.id === '1') { // Giảm giá item
      navigation.navigate('VoucherScreen');
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
            <Ionicons name={item.icon} size={24} color="#f6ac69" />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#A0AEC0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  item: {
    width: 60, // Fixed width for each item
    alignItems: 'center',
    marginRight: 24, // Consistent gap between items
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#2D3748',
    marginTop: 4,
    textAlign: 'center',
  },
});


export default Submenu;