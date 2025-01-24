import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import HomeScreen from './screens/home';
import HistoryScreen from './screens/history';
import ProfileScreen from './screens/profile';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('./assets/home.png')}
                style={{ width: size, height: size, tintColor: color }}
              />
            ),
          }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('./assets/history.png')}
                style={{ width: size, height: size, tintColor: color }}
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('./assets/profile.png')}
                style={{ width: size, height: size, tintColor: color }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
