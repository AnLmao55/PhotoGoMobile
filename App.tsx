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

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen
            name="SpinPrize"
            component={SpinPrizeGame}
            options={{
              title: 'Quay thưởng',
              headerShown: true
            }}
          />
          <Stack.Screen name='Detail' component={DetailScreen} />
          <Stack.Screen name='AllStudio' component={AllStudio}
            options={{
              title: 'Tất cả Studio',
              headerShown: true
            }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}