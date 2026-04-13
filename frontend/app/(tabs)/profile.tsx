import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { WebNavBar, WebContainer, WebFooter, useIsWebDesktop } from '@/src/components/WebShell';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isWeb = useIsWebDesktop();

  const handleLogout = async () => {
    // For web, use window.confirm instead of Alert.alert
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        await logout();
        router.replace('/(tabs)/home');
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out', style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(tabs)/home');
          },
        },
      ]);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Station Admin';
      case 'dj': return 'On-Air Talent';
      case 'editor': return 'News Editor';
      default: return 'Listener';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return Colors.accent;
      case 'dj': return Colors.primary;
      case 'editor': return Colors.secondary;
      default: return Colors.textSecondary;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notAuth}>
          <Ionicons name="person-circle-outline" size={80} color={Colors.textMuted} />
          <Text style={styles.notAuthTitle}>Not Signed In</Text>
          <Text style={styles.notAuthSub}>Sign in to access your profile</Text>
          <TouchableOpacity testID="profile-login-btn" style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const profileContent = (
    <View style={[isWeb && { maxWidth: 600, alignSelf: 'center' as any, width: '100%', paddingTop: 40 }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isWeb && { fontSize: 32 }]}>PROFILE</Text>
        </View>

        {/* Avatar & Name */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={[styles.roleBadge, { borderColor: getRoleColor(user.role) }]}>
            <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
              {getRoleLabel(user.role)}
            </Text>
          </View>
        </View>

        {/* Admin Access */}
        {(user.role === 'admin' || user.role === 'dj' || user.role === 'editor') && (
          <TouchableOpacity
            testID="dashboard-access-btn"
            style={styles.menuItem}
            onPress={() => router.push('/admin')}
          >
            <Ionicons name="grid" size={22} color={Colors.primary} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Dashboard</Text>
              <Text style={styles.menuSub}>Manage station content</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <TouchableOpacity testID="about-btn" style={styles.menuItem}>
          <Ionicons name="information-circle" size={22} color={Colors.secondary} />
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>About The Beat 515</Text>
            <Text style={styles.menuSub}>Proud. Loud. Local.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity testID="contact-btn" style={styles.menuItem}>
          <Ionicons name="call" size={22} color={Colors.accent} />
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>Contact Us</Text>
            <Text style={styles.menuSub}>Get in touch with the station</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity testID="logout-button" style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={22} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>The Beat 515 v1.0.0</Text>
        <View style={{ height: 40 }} />
    </View>
  );

  if (isWeb) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: Colors.background }}>
        <WebNavBar />
        <WebContainer>{profileContent}</WebContainer>
        <WebFooter />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll}>
        <View style={{ paddingHorizontal: Spacing.lg }}>{profileContent}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '900', color: Colors.white, letterSpacing: 3 },
  profileCard: {
    alignItems: 'center', padding: Spacing.xl,
    marginHorizontal: Spacing.lg, marginTop: Spacing.lg,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: Colors.white },
  userName: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.white },
  userEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
  roleBadge: {
    marginTop: Spacing.sm, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: BorderRadius.round, borderWidth: 1,
  },
  roleText: { fontSize: FontSizes.xs, fontWeight: '700', letterSpacing: 1 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  menuInfo: { flex: 1, marginLeft: Spacing.md },
  menuTitle: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.white },
  menuSub: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: Spacing.lg, marginTop: Spacing.xl,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutText: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.error },
  version: {
    textAlign: 'center', fontSize: FontSizes.xs, color: Colors.textMuted,
    marginTop: Spacing.lg,
  },
  notAuth: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  notAuthTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.white, marginTop: Spacing.md },
  notAuthSub: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: 4 },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.lg,
  },
  loginBtnText: { fontSize: FontSizes.base, fontWeight: '800', color: Colors.white, letterSpacing: 2 },
});
