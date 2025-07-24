import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from './src/store/store';
import LoginScreen from './src/screens/LoginScreen';
import TabNavigator from './src/navigation/TabNavigator';
import SpinPrizeGame from './src/screens/SpinPrize';
import DetailScreen from './src/screens/DetailScreen';
import AllStudio from './src/screens/AllStudio';
import AllServices from './src/screens/AllServices';
import Booking from './src/screens/Booking';
import MyOrder from './src/screens/MyOrder';
import OrderDetail from './src/screens/OrderDetail';
import { AlertProvider } from './src/components/Alert/AlertContext';
import { UserProfileProvider } from './src/contexts/UserProfileContext';
import { CartProvider } from './src/components/Alert/CartContext';
import RegisterScreen from './src/screens/RegisterScreen';
import ConceptViewer from './src/screens/ConceptViewer';
import VendorOwnerDashboard from './src/screens/VendorOwnerDashboard';
import UpcomingWorkshopsScreen from './src/screens/UpcomingWorkshopsScreen';
import { LogBox } from 'react-native';

// Set environment variables
import { Platform } from 'react-native';
import UpcomingWorkshopsScreenDetail from './src/screens/UpcomingWorkshopsScreenDetail';

if (Platform.OS !== 'web') {
  process.env.EXPO_PUBLIC_API_URL = 'https://api.photogo.id.vn/api/v1';
}

// Ignore specific warnings (optional)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <AlertProvider>
        <UserProfileProvider>
          <CartProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                  headerShown: false
                }}
              >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="MainTabs" component={TabNavigator} />
                <Stack.Screen name="VendorOwnerDashboard" component={VendorOwnerDashboard} />
                <Stack.Screen
                  name="SpinPrize"
                  component={SpinPrizeGame}
                  options={{
                    title: 'Quay thưởng',
                    headerShown: true
                  }}
                />
                <Stack.Screen name='Detail' component={DetailScreen}
                  options={{
                    title: 'Chi tiết',
                    headerShown: true
                  }}
                />
                <Stack.Screen name='AllStudio' component={AllStudio}
                  options={{
                    title: 'Tất cả Studio',
                    headerShown: true
                  }} 
                />
                <Stack.Screen name='AllServices' component={AllServices}
                  options={{
                    title: 'Tất cả dịch vụ',
                    headerShown: true
                  }} 
                />
                <Stack.Screen name='Booking' component={Booking}
                  options={{
                    title: 'Đặt lịch',
                    headerShown: true
                  }}
                />
                <Stack.Screen name='Concept' component={ConceptViewer}
                  options={{
                    title: 'Xem concept',
                    headerShown: true
                  }}
                />
                <Stack.Screen name='MyOrder' component={MyOrder}
                  options={{
                    title: 'Đơn hàng của tôi',
                    headerShown: true
                  }}
                />
                <Stack.Screen name='OrderDetail' component={OrderDetail}
                  options={{
                    title: 'Chi tiết đơn hàng',
                    headerShown: true
                  }}
                />
                <Stack.Screen name='UpcomingWorkshops' component={UpcomingWorkshopsScreen}
                  options={{
                    title: 'Lịch chụp hình',
                    headerShown: true
                  }}
                />
                <Stack.Screen name='UpcomingWorkshopsScreenDetail' component={UpcomingWorkshopsScreenDetail}
                  options={{
                    title: 'Chi tiết buổi chụp hình',
                    headerShown: true
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </CartProvider>
        </UserProfileProvider>
      </AlertProvider>
    </Provider>
  );
}