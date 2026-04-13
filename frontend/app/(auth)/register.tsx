import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>THE BEAT</Text>
            <Text style={styles.brandNum}>515</Text>
            <Text style={styles.tagline}>PROUD. LOUD. LOCAL.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Join The Beat</Text>
            <Text style={styles.subtitle}>Create your listener account</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>NAME</Text>
            <TextInput
              testID="register-name-input"
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              testID="register-email-input"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              testID="register-password-input"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />

            <TouchableOpacity
              testID="register-submit-button"
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              testID="go-to-login-button"
              onPress={() => router.back()}
              style={styles.linkBtn}
            >
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkAccent}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  brand: { fontSize: 42, fontWeight: '900', color: Colors.primary, letterSpacing: 6 },
  brandNum: { fontSize: 64, fontWeight: '900', color: Colors.white, letterSpacing: 8, marginTop: -10 },
  tagline: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.secondary, letterSpacing: 6, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.secondary, letterSpacing: 2, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: FontSizes.base, fontWeight: '800', color: Colors.white, letterSpacing: 2 },
  linkBtn: { alignItems: 'center', marginTop: Spacing.lg },
  linkText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  linkAccent: { color: Colors.secondary, fontWeight: '600' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: Colors.error, fontSize: FontSizes.sm, textAlign: 'center' },
});
