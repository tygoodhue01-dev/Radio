import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { AuthProvider } from '@/src/contexts/AuthContext';

// Initialize push notifications on native platforms
function PushNotificationInitializer() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Dynamic import to avoid web issues
      import('@/src/hooks/usePushNotifications').then(({ default: usePushNotifications }) => {
        // The hook will be used in components that need it
        console.log('Push notification module loaded');
      }).catch(err => {
        console.log('Push notifications not available:', err);
      });
    }
  }, []);
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <PushNotificationInitializer />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090b' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="news/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="admin/index" />
      </Stack>
    </AuthProvider>
  );
}
