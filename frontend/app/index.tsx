import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors } from '@/src/theme';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>THE BEAT 515</Text>
      <Text style={styles.tagline}>PROUD. LOUD. LOCAL.</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    letterSpacing: 4,
    marginTop: 8,
  },
});
