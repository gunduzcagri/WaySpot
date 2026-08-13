import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapScreen from '../screens/map/MapScreen';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import SavedRoutesScreen from '../screens/profile/SavedRoutesScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import BusinessDashboardScreen from '../screens/business/BusinessDashboardScreen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../utils/constants';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { user } = useAuth();
  const theme = useTheme();
  const isBusiness = user?.role === 2;
  const isAdmin = user?.role === 3;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Harita') iconName = 'map';
          else if (route.name === 'Kesfet') iconName = 'compass';
          else if (route.name === 'Rotalar') iconName = 'routes';
          else if (route.name === 'Panel') iconName = 'store';
          else if (route.name === 'Profil') iconName = 'account';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.bgCard, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
      })}
    >
      <Tab.Screen name="Harita" component={MapScreen} />
      <Tab.Screen name="Kesfet" component={DiscoverScreen} />
      <Tab.Screen name="Rotalar" component={SavedRoutesScreen} />
      {isBusiness && <Tab.Screen name="Panel" component={BusinessDashboardScreen} />}
      <Tab.Screen name="Profil" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}
