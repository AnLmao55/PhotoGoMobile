import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import DashboardScreen from '../../screens/vendor/DashboardScreen';
import ProfileScreen from '../../screens/vendor/ProfileScreen';
import ScheduleScreen from '../../screens/vendor/ScheduleScreen';

// Placeholder screens - these would be replaced with actual screens
const ServicesScreen = () => <View style={styles.screen}><Text>Services</Text></View>;
const StatsScreen = () => <View style={styles.screen}><Text>Statistics</Text></View>;

const Tab = createBottomTabNavigator();

const TabNavigatorVendor: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon;
          
          if (route.name === 'Dashboard') {
            icon = <Ionicons name="home-outline" size={size} color={color} />;
          } else if (route.name === 'Services') {
            icon = <MaterialIcons name="category" size={size} color={color} />;
          } else if (route.name === 'Schedule') {
            icon = <Ionicons name="calendar-outline" size={size} color={color} />;
          } else if (route.name === 'Statistics') {
            icon = <Ionicons name="stats-chart-outline" size={size} color={color} />;
          } else if (route.name === 'Profile') {
            icon = <Ionicons name="person-outline" size={size} color={color} />;
          }
          
          return icon;
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
      
      <Tab.Screen 
        name="Schedule" 
        component={ScheduleScreen}
        options={{
          tabBarLabel: "Lịch",
          title: "Lịch làm việc"
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: "Hồ sơ",
          title: "Hồ sơ"
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default TabNavigatorVendor;
