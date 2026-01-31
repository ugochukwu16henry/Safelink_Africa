import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from './src/screens/HomeScreen';
import { SOSScreen } from './src/screens/SOSScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.safeTeal },
            headerTintColor: colors.snow,
            headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            tabBarActiveTintColor: colors.safeTeal,
            tabBarInactiveTintColor: colors.inkMuted,
            tabBarStyle: { backgroundColor: colors.snow },
            tabBarLabelStyle: { fontWeight: '600' },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'SafeLink Africa' }} />
          <Tab.Screen name="SOS" component={SOSScreen} options={{ title: 'SOS' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
