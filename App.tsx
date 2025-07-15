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
import { AlertProvider } from './src/components/Alert/AlertContext';
import RegisterScreen from './src/screens/RegisterScreen';
import ConceptViewer from './src/screens/ConceptViewer';
const Stack = createStackNavigator();

export default function App() {
  return (

    <Provider store={store}>
      <AlertProvider>
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
              }} />
            <Stack.Screen name='AllServices' component={AllServices}
              options={{
                title: 'Tất cả dịch vụ',
                headerShown: true
              }} />
            <Stack.Screen name='Booking' component={Booking}
              options={{
                title: 'Đặt lịch',
                headerShown: true
              }} />
            <Stack.Screen name='Concept' component={ConceptViewer}
              options={{
                title: 'Xem concept',
                headerShown: true
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AlertProvider>
    </Provider>

  );
}