import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../../screens/HomeScreen';
import { theme } from '../../theme/theme';

// Placeholder screens for other tabs
const CartScreen: React.FC = () => <></>;
const FavoritesScreen: React.FC = () => <></>;
const ProfileScreen: React.FC = () => <></>;

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          if (route.name === 'Trang chủ') {
            iconName = 'home';
          } else if (route.name === 'Giỏ hàng') {
            iconName = 'cart';
          } else if (route.name === 'Yêu thích') {
            iconName = 'heart';
          } else if (route.name === 'Hồ sơ') {
            iconName = 'person';
          } else {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.lightText,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 0,
          elevation: 10, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          borderRadius: 30, // Pill-like border radius
          marginHorizontal: theme.spacing.md, // Horizontal margin for pill shape
          marginBottom: theme.spacing.md, // Float above bottom edge
          height: 60,
          paddingHorizontal: theme.spacing.sm, // Horizontal padding for content
          paddingBottom: theme.spacing.xs, // Bottom padding for content
          position: 'absolute', // Float above content
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSizes.sm,
          marginBottom: theme.spacing.xs,
        },
      })}
    >
      <Tab.Screen name="Trang chủ" component={HomeScreen} />
      <Tab.Screen name="Giỏ hàng" component={CartScreen} />
      <Tab.Screen name="Yêu thích" component={FavoritesScreen} />
      <Tab.Screen name="Hồ sơ" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;