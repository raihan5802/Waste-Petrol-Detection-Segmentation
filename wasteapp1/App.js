// App.js
import 'react-native-gesture-handler'; // Must be at the top
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import HomeScreen from './screens/HomeScreen';
import ComplaintLogScreen from './screens/ComplaintLogScreen';
import MapHeatmapScreen from './screens/MapHeatmapScreen';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',
    accent: '#FFC107',
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.gestureHandlerRootView}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ color, size }) => {
                if (route.name === 'Home') {
                  return <MaterialIcons name="home" size={size} color={color} />;
                } else if (route.name === 'Complaints') {
                  return <FontAwesome5 name="clipboard-list" size={size} color={color} />;
                } else if (route.name === 'Heatmap') {
                  return <Ionicons name="map" size={size} color={color} />;
                }
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: 'gray',
              tabBarStyle: {
                backgroundColor: '#ffffff',
                borderTopWidth: 0,
                elevation: 5,
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Complaints" component={ComplaintLogScreen} />
            <Tab.Screen name="Heatmap" component={MapHeatmapScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureHandlerRootView: {
    flex: 1,
  },
});
