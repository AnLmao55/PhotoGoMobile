import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import HomeScreen from '../../screens/HomeScreen';
import { theme } from '../../theme/theme';
import UserProfileScreen from '../../screens/UserProfileScreen';
import CartScreen from '../../screens/CartScreen';
import { useCart } from '../../components/Alert/CartContext';

// Placeholder screens for other tabs
const FavoritesScreen: React.FC = () => <></>;

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  const { cartItemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Trang chủ') {
            iconName = 'home-outline';
          } else if (route.name === 'Giỏ hàng') {

            iconName = 'cart';
            // Return custom icon with badge for cart
            return (
              <View>
                <Ionicons name={iconName} size={size} color={color} />
                {cartItemCount > 0 && (
                  <View style={{
                    position: 'absolute',
                    right: -6,
                    top: -3,
                    backgroundColor: '#FF4757',
                    borderRadius: 10,
                    width: 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </Text>
                  </View>
                )}
              </View>
            );

          } 
           else if (route.name === 'Hồ sơ') {
            iconName = 'person-outline';
          } else {
            iconName = 'person-outline';
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
      <Tab.Screen name="Hồ sơ" component={UserProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;