import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import BusinessDetailScreen from '../screens/business/BusinessDetailScreen';
import AddReviewScreen from '../screens/review/AddReviewScreen';
import RoutePlannerScreen from '../screens/route/RoutePlannerScreen';
import LoadingSpinner from '../components/LoadingSpinner';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainNavigator} />
              <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} options={{ headerShown: true, title: 'Isletme Detayi' }} />
              <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ headerShown: true, title: 'Yorum Yap' }} />
              <Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} options={{ headerShown: true, title: 'Rota Planla' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
